from datetime import date, datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

import pytest
from rest_framework.test import APIClient

from gyms.models import (
    Audience,
    Chain,
    Discount,
    Gym,
    GymType,
    MembershipPlan,
    OpeningHours,
    PlanAccessWindow,
    Street,
)
from gyms.services import CatalogService

KYIV = ZoneInfo("Europe/Kyiv")
# 2026-11-16 is a Monday.
MONDAY_NOON = datetime(2026, 11, 16, 12, 0, tzinfo=KYIV)
LOCATION = {"latitude": Decimal("50.745126"), "longitude": Decimal("25.339579")}


@pytest.fixture
def chain() -> Chain:
    return Chain.objects.create(name="IA", slug="ia", instagram_url="https://instagram.com/ia")


@pytest.fixture
def street() -> Street:
    return Street.objects.create(name="вул. Львівська", slug="lvivska")


def make_gym(chain: Chain, street: Street, slug: str, published: bool = True) -> Gym:
    return Gym.objects.create(
        chain=chain,
        street=street,
        name=slug,
        slug=slug,
        building="7А",
        is_published=published,
        **LOCATION,
    )


@pytest.fixture
def gym(chain: Chain, street: Street) -> Gym:
    return make_gym(chain, street, "lvivska")


def make_plan(chain: Chain, name: str, price: str, **fields) -> MembershipPlan:
    return MembershipPlan.objects.create(
        chain=chain, name=name, price=Decimal(price), duration_days=30, **fields
    )


@pytest.mark.django_db
def test_profile_shows_gym_and_chain_details(gym):
    gym.types.set([GymType.objects.create(name="Басейн", slug="pool")])

    response = APIClient().get("/api/v1/gyms/lvivska/")

    assert response.status_code == 200
    body = response.json()
    assert body["address"] == "вул. Львівська, 7А"
    assert body["chain_name"] == "IA"
    assert body["instagram_url"] == "https://instagram.com/ia"
    assert body["types"] == [{"slug": "pool", "name": "Басейн"}]
    assert (body["latitude"], body["longitude"]) == (50.745126, 25.339579)


@pytest.mark.django_db
@pytest.mark.parametrize("slug", ["draft", "nowhere"], ids=["draft", "missing"])
def test_draft_or_missing_gym_is_not_found(chain, street, slug):
    make_gym(chain, street, "draft", published=False)

    response = APIClient().get(f"/api/v1/gyms/{slug}/")

    assert response.status_code == 404


@pytest.mark.django_db
def test_week_marks_today_and_closed_days(gym):
    OpeningHours.objects.create(gym=gym, weekday=0, opens_at="08:00", closes_at="21:00")

    profile = CatalogService().get_gym("lvivska", now=MONDAY_NOON)

    assert profile.is_open_now
    assert profile.week[0].hours == "08:00–21:00"
    assert profile.week[0].is_today
    assert profile.week[1].hours is None
    assert not profile.week[1].is_today


@pytest.mark.django_db
def test_plans_include_chain_wide_and_own_but_not_inactive(chain, gym):
    make_plan(chain, "Month", "1350")
    make_plan(chain, "Lvivska month", "900", gym=gym)
    make_plan(chain, "Old month", "500", is_active=False)

    profile = CatalogService().get_gym("lvivska", now=MONDAY_NOON)

    assert [plan.name for plan in profile.plans] == ["Lvivska month", "Month"]


@pytest.mark.django_db
def test_plan_price_includes_an_active_discount(chain, gym):
    plan = make_plan(chain, "Month", "1000")
    Discount.objects.create(
        plan=plan, kind="percent", value=Decimal("20"), ends_on=date(2026, 11, 30)
    )

    [offer] = CatalogService().get_gym("lvivska", now=MONDAY_NOON).plans

    assert offer.price == Decimal("800")
    assert offer.discount.full_price == Decimal("1000")


@pytest.mark.django_db
def test_plan_shows_who_when_and_how_often_it_works(chain, gym):
    plan = make_plan(chain, "Student 12", "600", visits_limit=12)
    plan.audiences.set([Audience.objects.create(name="Студенти", slug="students")])
    for weekday in (0, 2, 4):
        PlanAccessWindow.objects.create(plan=plan, weekday=weekday, ends_at="18:00")

    [offer] = CatalogService().get_gym("lvivska", now=MONDAY_NOON).plans

    assert offer.visits_limit == 12
    assert [audience.name for audience in offer.audiences] == ["Студенти"]
    assert offer.access_hours == "Пн, Ср, Пт до 18:00"
