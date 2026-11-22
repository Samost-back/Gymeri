from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

import pytest
from rest_framework.test import APIClient

from gyms.models import Amenity, Chain, Gym, MembershipPlan, OpeningHours, Street
from gyms.search import GymSearchCriteria
from gyms.services import GymSearchService

KYIV = ZoneInfo("Europe/Kyiv")
# Published gyms need a map point; its value doesn't matter to these tests.
LOCATION = {"latitude": Decimal("50.75"), "longitude": Decimal("25.33")}


@pytest.fixture
def catalog() -> dict[str, Gym]:
    """IA has two gyms on different streets; only the one on Lvivska has a pool."""
    ia = Chain.objects.create(name="IA", slug="ia")
    lvivska_street = Street.objects.create(name="вул. Львівська", slug="lvivska")
    koniakina_street = Street.objects.create(name="вул. Конякіна", slug="koniakina")
    pool = Amenity.objects.create(name="Басейн", slug="pool")
    strength = Amenity.objects.create(name="Силовий зал", slug="strength")

    lvivska = Gym.objects.create(
        chain=ia,
        street=lvivska_street,
        name="Lvivska",
        slug="lvivska",
        building="1",
        is_published=True,
        **LOCATION,
    )
    lvivska.amenities.set([pool, strength])
    koniakina = Gym.objects.create(
        chain=ia,
        street=koniakina_street,
        name="Koniakina",
        slug="koniakina",
        building="1",
        is_published=True,
        **LOCATION,
    )
    koniakina.amenities.set([strength])
    for day in range(7):
        OpeningHours.objects.create(gym=koniakina, weekday=day, opens_at="00:00", closes_at="00:00")
    OpeningHours.objects.create(gym=lvivska, weekday=0, opens_at="08:00", closes_at="21:00")

    MembershipPlan.objects.create(chain=ia, name="Month", price=Decimal("1350"), duration_days=30)
    MembershipPlan.objects.create(
        chain=ia, gym=lvivska, name="Pool month", price=Decimal("900"), duration_days=30
    )
    return {"lvivska": lvivska, "koniakina": koniakina}


def search_slugs(query: str) -> list[str]:
    response = APIClient().get(f"/api/v1/gyms/{query}")
    assert response.status_code == 200, response.json()
    return [gym["slug"] for gym in response.json()]


@pytest.mark.django_db
def test_gym_must_have_all_requested_amenities(catalog):
    assert search_slugs("?amenity=strength&amenity=pool") == ["lvivska"]


@pytest.mark.django_db
def test_filter_by_street(catalog):
    assert search_slugs("?street=koniakina") == ["koniakina"]


@pytest.mark.django_db
def test_filter_by_chain(catalog):
    other = Chain.objects.create(name="Other", slug="other")
    Gym.objects.create(
        chain=other,
        street=catalog["lvivska"].street,
        name="Other gym",
        slug="other-gym",
        building="1",
        is_published=True,
        **LOCATION,
    )

    assert search_slugs("?chain=other") == ["other-gym"]
    assert search_slugs("?chain=ia") == ["koniakina", "lvivska"]


@pytest.mark.django_db
def test_round_the_clock_filter_uses_schedule(catalog):
    assert search_slugs("?round_the_clock=true") == ["koniakina"]


@pytest.mark.django_db
def test_open_now_depends_on_current_time(catalog):
    criteria = GymSearchCriteria(open_now=True)
    monday_night = datetime(2026, 11, 16, 23, 0, tzinfo=KYIV)

    found = GymSearchService().search(criteria, now=monday_night)

    assert [gym.slug for gym in found] == ["koniakina"]


@pytest.mark.django_db
def test_gym_price_includes_its_own_plans(catalog):
    gyms = {gym["slug"]: gym for gym in APIClient().get("/api/v1/gyms/").json()}

    assert gyms["lvivska"]["price_from"] == "900.00"
    assert gyms["koniakina"]["price_from"] == "1350.00"


@pytest.mark.django_db
def test_unpublished_gym_is_not_found(catalog):
    catalog["lvivska"].is_published = False
    catalog["lvivska"].save()

    assert search_slugs("") == ["koniakina"]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "query",
    ["?street=nowhere", "?amenity=sauna", "?sort=rating"],
    ids=["unknown street", "unknown amenity", "unknown sort"],
)
def test_invalid_filter_returns_bad_request(catalog, query):
    response = APIClient().get(f"/api/v1/gyms/{query}")

    assert response.status_code == 400
    assert "detail" in response.json()


@pytest.mark.django_db
def test_filter_options_list_only_values_of_published_gyms(catalog):
    catalog["lvivska"].is_published = False
    catalog["lvivska"].save()

    options = APIClient().get("/api/v1/catalog/filters/").json()

    assert [s["slug"] for s in options["streets"]] == ["koniakina"]
    assert [a["slug"] for a in options["amenities"]] == ["strength"]
