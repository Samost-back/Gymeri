from datetime import date
from decimal import Decimal

import pytest

from gyms.exceptions import InvalidPromo
from gyms.pricing import PlanPrice, PriceList
from gyms.services import PlanPromoService

TODAY = date(2026, 11, 23)
YESTERDAY = date(2026, 11, 22)


def promo(price: str, days: int = 30, **fields) -> PlanPrice:
    return PlanPrice(Decimal(price), days, is_promo=True, **fields)


def test_regular_plan_cannot_have_a_promo_end_date():
    with pytest.raises(InvalidPromo):
        PlanPrice(Decimal("1000"), 30, promo_ends_on=TODAY)


@pytest.mark.parametrize(("ends_on", "sold"), [(TODAY, True), (YESTERDAY, False), (None, True)])
def test_promo_is_sold_until_its_last_day(ends_on, sold):
    assert promo("1000", promo_ends_on=ends_on).is_sold_on(TODAY) is sold


def test_from_price_counts_a_monthly_promo_until_it_ends():
    prices = PriceList([PlanPrice(Decimal("1350"), 30), promo("990", promo_ends_on=TODAY)])

    assert prices.monthly_from(TODAY) == Decimal("990")
    assert prices.monthly_from(date(2026, 11, 24)) == Decimal("1350")


def test_card_shows_the_promo_with_the_lowest_price_per_month():
    three_months = promo("1500", days=90, name="3 months")
    prices = PriceList([PlanPrice(Decimal("400"), 30), promo("600", name="Month"), three_months])

    assert three_months.monthly_price == Decimal("500")
    assert prices.best_promo(TODAY) == three_months


def test_ended_promo_neither_shows_nor_lists_its_group():
    trial = promo("500", audiences=frozenset({"newcomers"}), promo_ends_on=YESTERDAY)
    prices = PriceList([trial])

    assert prices.best_promo(TODAY) is None
    assert prices.audiences(TODAY) == frozenset()


@pytest.mark.parametrize(
    ("is_promo", "ends_on"),
    [(False, TODAY), (True, YESTERDAY)],
    ids=["end date without promo", "ends in the past"],
)
def test_admin_rejects_promo_dates_that_make_no_sense(is_promo, ends_on):
    with pytest.raises(InvalidPromo):
        PlanPromoService().validate(is_promo=is_promo, promo_ends_on=ends_on, today=TODAY)
