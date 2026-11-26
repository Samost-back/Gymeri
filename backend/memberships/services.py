from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from django.contrib.auth.models import AbstractBaseUser
from django.db import transaction
from django.db.models import QuerySet
from django.utils import timezone

from gyms.exceptions import GymNotFound
from gyms.services import CatalogService, GymProfile

from .domain import Membership as DomainMembership
from .domain import MembershipStatus, Period, check_start, make_membership
from .exceptions import GymNotAvailable, MembershipNotFound, NoHomeGym
from .models import HomeGym, Membership, Visit


@dataclass(frozen=True)
class Terms:
    """What the client fills in: usually copied from a plan of their gym, then edited."""

    name: str
    price: Decimal
    duration_days: int
    visits_limit: int | None


@dataclass(frozen=True)
class MembershipCard:
    """One membership as the account page shows it, with everything already counted."""

    id: int
    gym_slug: str
    gym_name: str
    name: str
    price: Decimal
    starts_on: date
    ends_on: date
    status: MembershipStatus
    days_left: int
    # None for a membership that doesn't count visits.
    visits_limit: int | None
    visits_used: int | None
    visits_left: int | None
    visited_today: bool


@dataclass(frozen=True)
class Account:
    # None until a gym is chosen, or when the chosen gym has left the catalog.
    gym: GymProfile | None
    memberships: list[MembershipCard]


class MembershipService:
    """The client's own gym and memberships. Every method takes the owner and only ever
    touches their rows."""

    def get_account(self, user: AbstractBaseUser, today: date | None = None) -> Account:
        today = today or timezone.localdate()
        return Account(gym=self._home_gym_profile(user), memberships=self._cards(user, today))

    def choose_gym(self, user: AbstractBaseUser, gym_slug: str) -> None:
        try:
            gym_id = CatalogService().get_gym_id(gym_slug)
        except GymNotFound as error:
            raise GymNotAvailable from error
        HomeGym.objects.update_or_create(user=user, defaults={"gym_id": gym_id})

    def clear_gym(self, user: AbstractBaseUser) -> None:
        """Forget the chosen gym. Memberships stay: each keeps the gym it was bought in."""
        HomeGym.objects.filter(user=user).delete()

    def add(
        self, user: AbstractBaseUser, terms: Terms, starts_on: date, today: date | None = None
    ) -> MembershipCard:
        today = today or timezone.localdate()
        gym_id = self._home_gym_id(user)
        # The domain rejects impossible terms before anything is saved.
        check_start(starts_on, today)
        make_membership(
            terms.name, terms.price, Period(starts_on, terms.duration_days), terms.visits_limit
        )
        row = Membership.objects.create(
            owner=user,
            gym_id=gym_id,
            name=terms.name,
            price=terms.price,
            duration_days=terms.duration_days,
            visits_limit=terms.visits_limit,
            starts_on=starts_on,
        )
        return self._card(self._get_own(user, row.pk), today)

    def delete(self, user: AbstractBaseUser, membership_id: int) -> None:
        self._get_own(user, membership_id).delete()

    def record_visit(
        self, user: AbstractBaseUser, membership_id: int, today: date | None = None
    ) -> MembershipCard:
        today = today or timezone.localdate()
        with transaction.atomic():
            # Locks the membership first, so two visits sent at once are checked one after the
            # other and can't both pass the visit limit.
            Membership.objects.select_for_update().filter(owner=user, pk=membership_id).first()
            row = self._get_own(user, membership_id)
            self._to_domain(row).record_visit(today)
            Visit.objects.create(membership=row, day=today)
        return self._card(self._get_own(user, membership_id), today)

    def cancel_visit(
        self, user: AbstractBaseUser, membership_id: int, today: date | None = None
    ) -> MembershipCard:
        today = today or timezone.localdate()
        row = self._get_own(user, membership_id)
        self._to_domain(row).cancel_visit(today)
        row.visits.filter(day=today).delete()
        return self._card(self._get_own(user, membership_id), today)

    @staticmethod
    def _home_gym_id(user: AbstractBaseUser) -> int:
        """The chosen gym, while it is still in the catalog; one that left counts as none, the
        same as on the account page."""
        home = HomeGym.objects.filter(user=user).select_related("gym").first()
        if home is None:
            raise NoHomeGym
        try:
            return CatalogService().get_gym_id(home.gym.slug)
        except GymNotFound as error:
            raise NoHomeGym from error

    def _home_gym_profile(self, user: AbstractBaseUser) -> GymProfile | None:
        home = HomeGym.objects.filter(user=user).select_related("gym").first()
        if home is None:
            return None
        try:
            return CatalogService().get_gym(home.gym.slug)
        except GymNotFound:
            return None

    def _cards(self, user: AbstractBaseUser, today: date) -> list[MembershipCard]:
        rows = self._own_rows(user)
        return [self._card(row, today) for row in rows]

    def _get_own(self, user: AbstractBaseUser, membership_id: int) -> Membership:
        row = self._own_rows(user).filter(pk=membership_id).first()
        if row is None:
            raise MembershipNotFound
        return row

    @staticmethod
    def _own_rows(user: AbstractBaseUser) -> QuerySet[Membership]:
        # The gym's slug and name are read through the foreign key: a plain field read, not a
        # query into gyms' models, and it keeps the list to two queries however long it is.
        return (
            Membership.objects.filter(owner=user).select_related("gym").prefetch_related("visits")
        )

    @staticmethod
    def _to_domain(row: Membership) -> DomainMembership:
        return make_membership(
            row.name,
            row.price,
            Period(row.starts_on, row.duration_days),
            row.visits_limit,
            (visit.day for visit in row.visits.all()),
        )

    def _card(self, row: Membership, today: date) -> MembershipCard:
        membership = self._to_domain(row)
        return MembershipCard(
            id=row.pk,
            gym_slug=row.gym.slug,
            gym_name=row.gym.name,
            name=membership.name,
            price=membership.price,
            starts_on=membership.period.starts_on,
            ends_on=membership.period.ends_on,
            status=membership.status(today),
            days_left=membership.period.days_left(today),
            visits_limit=membership.visits_limit,
            visits_used=membership.visits_used,
            visits_left=membership.visits_left,
            visited_today=membership.has_visit_on(today),
        )
