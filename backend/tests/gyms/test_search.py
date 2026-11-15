from decimal import Decimal

import pytest

from gyms.exceptions import InvalidFilter
from gyms.search import GymListing, GymSearchCriteria, SortByArea, SortByPrice


def listing(name: str, price: str | None = None, area: int | None = None) -> GymListing:
    return GymListing(
        slug=name,
        name=name,
        chain_slug="ia",
        chain_name="IA",
        district="Центр",
        address="x",
        highlight="",
        area_m2=area,
        amenities=[],
        hours_summary="",
        is_open_now=False,
        is_round_the_clock=False,
        price_from=Decimal(price) if price else None,
        photo_url=None,
    )


def test_criteria_default_to_sort_by_name_without_filters():
    criteria = GymSearchCriteria.from_query({}, amenities=[])

    assert criteria.sort.code == "name"
    assert criteria.district is None
    assert not criteria.open_now


@pytest.mark.parametrize(
    "params",
    [{"sort": "rating"}, {"open_now": "yes"}],
    ids=["unknown sort", "bad flag"],
)
def test_invalid_query_is_rejected(params):
    with pytest.raises(InvalidFilter):
        GymSearchCriteria.from_query(params, amenities=[])


def test_sort_by_price_puts_gyms_without_price_last():
    gyms = [listing("A"), listing("B", "1350"), listing("C", "850")]

    assert [gym.name for gym in SortByPrice().sort(gyms)] == ["C", "B", "A"]


def test_sort_by_area_puts_biggest_first_and_unknown_last():
    gyms = [listing("A"), listing("B", area=900), listing("C", area=1800)]

    assert [gym.name for gym in SortByArea().sort(gyms)] == ["C", "B", "A"]
