from datetime import date
from decimal import Decimal

import pytest

from accounts.models import User
from gyms.models import Chain, Gym, Street
from memberships.domain import MembershipStatus
from memberships.exceptions import (
    GymNotAvailable,
    InvalidTerms,
    MembershipNotFound,
    NoHomeGym,
    VisitNotAllowed,
)
from memberships.models import Membership
from memberships.services import MembershipService, Terms

pytestmark = pytest.mark.django_db

DEC_1 = date(2026, 12, 1)
UNLIMITED = Terms("Безліміт", Decimal("900"), 30, None)
TWELVE_VISITS = Terms("12 візитів", Decimal("700"), 30, 12)


@pytest.fixture
def service() -> MembershipService:
    return MembershipService()


@pytest.fixture
def olena() -> User:
    return User.objects.create_user("olena@example.com", "Gym-pass-2026")


def test_unpublished_gym_cannot_be_chosen(service, ivan, gym):
    Gym.objects.filter(pk=gym.pk).update(is_published=False)

    with pytest.raises(GymNotAvailable):
        service.choose_gym(ivan, gym.slug)


def test_membership_needs_a_chosen_gym(service, ivan):
    with pytest.raises(NoHomeGym):
        service.add(ivan, UNLIMITED, DEC_1)


def test_no_new_memberships_for_a_gym_that_left_the_catalog(service, ivan, gym):
    service.choose_gym(ivan, gym.slug)
    Gym.objects.filter(pk=gym.pk).update(is_published=False)

    with pytest.raises(NoHomeGym):
        service.add(ivan, UNLIMITED, DEC_1, today=DEC_1)


def test_new_memberships_go_to_the_current_gym_and_old_ones_stay(service, ivan, gym):
    other = Gym.objects.create(
        chain=Chain.objects.get(),
        street=Street.objects.get(),
        name="Interatletika Lviv",
        slug="ia-lviv",
        building="2",
        latitude=Decimal("50.74"),
        longitude=Decimal("25.32"),
        is_published=True,
    )
    service.choose_gym(ivan, gym.slug)
    service.add(ivan, UNLIMITED, DEC_1, today=DEC_1)

    service.choose_gym(ivan, other.slug)
    service.add(ivan, TWELVE_VISITS, DEC_1, today=DEC_1)

    account = service.get_account(ivan, today=DEC_1)
    assert account.gym.slug == other.slug
    assert {card.gym_name for card in account.memberships} == {gym.name, other.name}


def test_impossible_terms_save_nothing(service, ivan, gym):
    service.choose_gym(ivan, gym.slug)

    with pytest.raises(InvalidTerms):
        service.add(ivan, Terms("  ", Decimal("900"), 30, None), DEC_1, today=DEC_1)

    assert not Membership.objects.exists()


def test_different_memberships_live_side_by_side(service, ivan, gym):
    service.choose_gym(ivan, gym.slug)
    service.add(ivan, UNLIMITED, DEC_1, today=DEC_1)
    service.add(ivan, TWELVE_VISITS, date(2026, 12, 10), today=DEC_1)

    account = service.get_account(ivan, today=date(2026, 12, 5))

    assert account.gym.slug == gym.slug
    unlimited, pack = sorted(account.memberships, key=lambda card: card.starts_on)
    assert (unlimited.status, unlimited.days_left, unlimited.visits_left) == (
        MembershipStatus.ACTIVE,
        26,
        None,
    )
    assert (pack.status, pack.ends_on, pack.visits_left) == (
        MembershipStatus.UPCOMING,
        date(2027, 1, 8),
        12,
    )


def test_visit_is_counted_and_can_be_taken_back(service, ivan, visit_pack):
    card = service.record_visit(ivan, visit_pack.pk, today=DEC_1)
    assert (card.visits_used, card.visits_left, card.visited_today) == (1, 11, True)

    card = service.cancel_visit(ivan, visit_pack.pk, today=DEC_1)
    assert (card.visits_used, card.visited_today) == (0, False)


def test_unlimited_membership_takes_no_visits(service, ivan, gym):
    service.choose_gym(ivan, gym.slug)
    card = service.add(ivan, UNLIMITED, DEC_1, today=DEC_1)

    with pytest.raises(VisitNotAllowed):
        service.record_visit(ivan, card.id, today=DEC_1)


def test_someone_elses_membership_looks_missing(service, olena, visit_pack):
    with pytest.raises(MembershipNotFound):
        service.record_visit(olena, visit_pack.pk, today=DEC_1)
    with pytest.raises(MembershipNotFound):
        service.delete(olena, visit_pack.pk)

    assert Membership.objects.filter(pk=visit_pack.pk).exists()


def test_memberships_stay_after_the_gym_leaves_the_catalog(service, ivan, gym, visit_pack):
    service.choose_gym(ivan, gym.slug)
    Gym.objects.filter(pk=gym.pk).update(is_published=False)

    account = service.get_account(ivan, today=DEC_1)

    assert account.gym is None
    assert [card.gym_name for card in account.memberships] == [gym.name]
