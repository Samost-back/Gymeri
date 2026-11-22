from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from gyms.models import Chain, Gym, MembershipPlan, Street

# Published gyms need a map point; its value doesn't matter to these tests.
LOCATION = {"latitude": Decimal("50.75"), "longitude": Decimal("25.33")}


@pytest.fixture
def api() -> APIClient:
    return APIClient()


@pytest.fixture
def streets() -> dict[str, Street]:
    return {
        slug: Street.objects.create(name=name, slug=slug)
        for slug, name in [("voli", "просп. Волі"), ("koniakina", "вул. Конякіна")]
    }


def make_gym(chain: Chain, street: Street, slug: str, published: bool = True) -> Gym:
    return Gym.objects.create(
        chain=chain,
        street=street,
        name=slug,
        slug=slug,
        building="1",
        is_published=published,
        **LOCATION,
    )


def make_plan(chain: Chain, name: str, price: str, days: int = 30, active: bool = True) -> None:
    MembershipPlan.objects.create(
        chain=chain, name=name, price=Decimal(price), duration_days=days, is_active=active
    )


@pytest.mark.django_db
def test_stats_count_only_published_gyms(api, streets):
    ia = Chain.objects.create(name="IA", slug="ia")
    hidden = Chain.objects.create(name="Hidden", slug="hidden")
    make_gym(ia, streets["voli"], "ia-1")
    make_gym(ia, streets["voli"], "ia-2")
    make_gym(hidden, streets["koniakina"], "hidden-1", published=False)

    response = api.get("/api/v1/catalog/stats/")

    assert response.status_code == 200
    assert response.json() == {"gyms": 2, "chains": 1, "streets": 1}


@pytest.mark.django_db
def test_chain_without_published_gyms_is_not_listed(api, streets):
    hidden = Chain.objects.create(name="Hidden", slug="hidden")
    make_gym(hidden, streets["voli"], "hidden-1", published=False)

    response = api.get("/api/v1/chains/")

    assert response.json() == []


@pytest.mark.django_db
def test_chain_card_counts_published_locations_and_their_streets(api, streets):
    ia = Chain.objects.create(name="IA", slug="ia")
    make_gym(ia, streets["voli"], "ia-1")
    make_gym(ia, streets["koniakina"], "ia-2")
    make_gym(ia, streets["koniakina"], "ia-3")
    make_gym(ia, streets["voli"], "ia-draft", published=False)

    [card] = api.get("/api/v1/chains/").json()

    assert card["locations_count"] == 3
    assert card["streets"] == ["вул. Конякіна", "просп. Волі"]


@pytest.mark.django_db
def test_price_from_is_cheapest_active_monthly_plan(api, streets):
    ia = Chain.objects.create(name="IA", slug="ia")
    make_gym(ia, streets["voli"], "ia-1")
    make_plan(ia, "Month", "1350")
    make_plan(ia, "Student month", "800")
    make_plan(ia, "Archived month", "500", active=False)
    make_plan(ia, "Year", "11800", days=365)

    [card] = api.get("/api/v1/chains/").json()

    assert card["price_from"] == "800.00"


@pytest.mark.django_db
def test_price_from_is_null_without_monthly_plans(api, streets):
    ia = Chain.objects.create(name="IA", slug="ia")
    make_gym(ia, streets["voli"], "ia-1")
    make_plan(ia, "Year", "11800", days=365)

    [card] = api.get("/api/v1/chains/").json()

    assert card["price_from"] is None
