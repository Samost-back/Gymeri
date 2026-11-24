from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from gyms.models import Chain, Gym, MembershipPlan, OpeningHours, PlanAccessWindow, Street


@pytest.fixture
def gym() -> Gym:
    chain = Chain.objects.create(name="Interatletyka", slug="interatletyka")
    street = Street.objects.create(name="просп. Волі", slug="voli")
    return Gym.objects.create(
        chain=chain, street=street, name="Interatletyka Center", slug="ia-center", building="1"
    )


def make_plan(gym: Gym, **overrides) -> MembershipPlan:
    fields = {"name": "Month", "price": Decimal("800.00"), "duration_days": 30} | overrides
    return MembershipPlan.objects.create(chain=gym.chain, **fields)


@pytest.mark.django_db
def test_gym_is_hidden_until_published(gym):
    assert gym.is_published is False


@pytest.mark.django_db
def test_second_interval_for_same_weekday_is_rejected(gym):
    OpeningHours.objects.create(gym=gym, weekday=0, opens_at="07:00", closes_at="22:00")

    with pytest.raises(IntegrityError):
        OpeningHours.objects.create(gym=gym, weekday=0, opens_at="08:00", closes_at="21:00")


@pytest.mark.django_db
def test_plan_with_unlimited_visits_is_valid(gym):
    plan = make_plan(gym, visits_limit=None)

    assert plan.visits_limit is None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "overrides",
    [
        {"price": Decimal("-1.00")},
        {"duration_days": 0},
        {"visits_limit": 0},
        {"promo_ends_on": "2026-12-31"},
    ],
    ids=["negative price", "zero duration", "zero visits", "promo end without promo"],
)
def test_invalid_plan_is_rejected_by_database(gym, overrides):
    with pytest.raises(IntegrityError):
        make_plan(gym, **overrides)


@pytest.mark.django_db
def test_duplicate_plan_name_in_same_chain_is_rejected(gym):
    make_plan(gym)

    with pytest.raises(IntegrityError):
        make_plan(gym)


@pytest.mark.django_db
def test_plan_cannot_be_tied_to_gym_of_another_chain(gym):
    other_chain = Chain.objects.create(name="Other", slug="other")
    plan = MembershipPlan(chain=other_chain, gym=gym, name="Month", price=800, duration_days=30)

    with pytest.raises(ValidationError):
        plan.full_clean()


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("starts_at", "ends_at"),
    [(None, None), ("18:00", "12:00")],
    ids=["no bounds", "starts after end"],
)
def test_invalid_access_window_is_rejected(gym, starts_at, ends_at):
    plan = make_plan(gym)

    with pytest.raises(IntegrityError):
        PlanAccessWindow.objects.create(plan=plan, weekday=0, starts_at=starts_at, ends_at=ends_at)
