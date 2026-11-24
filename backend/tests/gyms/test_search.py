from decimal import Decimal

import pytest

from gyms.exceptions import InvalidFilter
from gyms.pricing import PlanPrice
from gyms.search import GymListing, GymSearchCriteria, Label, SortByArea, SortByPrice

PROMO = PlanPrice(Decimal("1500"), 90, name="3 months", is_promo=True)


def listing(
    name: str,
    price: str | None = None,
    area: int | None = None,
    types: tuple[str, ...] = (),
    promo: bool = False,
) -> GymListing:
    return GymListing(
        slug=name,
        name=name,
        chain_slug="ia",
        chain_name="IA",
        street=Label("voli", "просп. Волі"),
        address="просп. Волі, 1",
        highlight="",
        area_m2=area,
        types=tuple(Label(slug, slug) for slug in types),
        audiences=(),
        promo=PROMO if promo else None,
        hours_summary="",
        is_open_now=False,
        price_from=Decimal(price) if price else None,
        photo_url=None,
    )


def test_criteria_default_to_sort_by_name_without_filters():
    criteria = GymSearchCriteria.from_query({}, types=[])

    assert criteria.sort.code == "name"
    assert criteria.filters() == []


@pytest.mark.parametrize(
    "params",
    [{"sort": "rating"}, {"promo": "yes"}],
    ids=["unknown sort", "bad flag"],
)
def test_invalid_query_is_rejected(params):
    with pytest.raises(InvalidFilter):
        GymSearchCriteria.from_query(params, types=[])


def test_sort_by_price_puts_gyms_without_price_last():
    gyms = [listing("A"), listing("B", "1350"), listing("C", "850")]

    assert [gym.name for gym in SortByPrice().sort(gyms)] == ["C", "B", "A"]


def test_sort_by_area_puts_biggest_first_and_unknown_last():
    gyms = [listing("A"), listing("B", area=900), listing("C", area=1800)]

    assert [gym.name for gym in SortByArea().sort(gyms)] == ["C", "B", "A"]


def test_full_type_matches_go_first_and_keep_the_sort_order():
    gyms = [
        listing("A", types=("crossfit",)),
        listing("B", types=("crossfit", "pool")),
        listing("C", types=("gym",)),
        listing("D", types=("pool", "crossfit")),
    ]
    criteria = GymSearchCriteria(types=frozenset({"crossfit", "pool"}))

    found = criteria.apply(gyms)

    assert [(gym.name, gym.is_full_match) for gym in found] == [
        ("B", True),
        ("D", True),
        ("A", False),
    ]


def test_promo_filter_keeps_only_gyms_with_a_promo():
    gyms = [listing("A", promo=True), listing("B")]

    assert [gym.name for gym in GymSearchCriteria(promo=True).apply(gyms)] == ["A"]
