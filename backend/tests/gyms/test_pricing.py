from datetime import date
from decimal import Decimal

from gyms.pricing import PlanPrice, PriceList

LVIVSKA = 1
VOLI = 2
TODAY = date(2026, 11, 23)


def price_list() -> PriceList:
    return PriceList(
        [
            PlanPrice(Decimal("1350"), 30),
            PlanPrice(Decimal("900"), 30, gym_id=LVIVSKA),
            PlanPrice(Decimal("500"), 365),
        ]
    )


def test_gym_price_counts_chain_plans_and_its_own():
    assert price_list().monthly_from(TODAY, LVIVSKA) == Decimal("900")


def test_gym_price_ignores_plans_of_other_gyms():
    assert price_list().monthly_from(TODAY, VOLI) == Decimal("1350")


def test_chain_price_counts_every_monthly_plan():
    assert price_list().monthly_from(TODAY) == Decimal("900")


def test_no_monthly_plans_means_no_price():
    assert PriceList([PlanPrice(Decimal("11800"), 365)]).monthly_from(TODAY) is None


def test_from_price_skips_plans_for_special_groups():
    prices = PriceList(
        [
            PlanPrice(Decimal("800"), 30, audiences=frozenset({"students"})),
            PlanPrice(Decimal("1350"), 30),
        ]
    )

    assert prices.monthly_from(TODAY) == Decimal("1350")


def test_gym_lists_the_groups_of_its_plans():
    prices = PriceList(
        [
            PlanPrice(Decimal("800"), 30, audiences=frozenset({"students", "pupils"})),
            PlanPrice(Decimal("1500"), 90, gym_id=VOLI, audiences=frozenset({"veterans"})),
        ]
    )

    assert prices.audiences(TODAY, LVIVSKA) == {"students", "pupils"}
    assert prices.audiences(TODAY, VOLI) == {"students", "pupils", "veterans"}


def test_gym_plans_put_everyone_first_then_shorter_and_cheaper():
    prices = PriceList(
        [
            PlanPrice(Decimal("11800"), 365, name="Year"),
            PlanPrice(Decimal("800"), 30, audiences=frozenset({"students"}), name="Student"),
            PlanPrice(Decimal("1350"), 30, name="Month"),
            PlanPrice(Decimal("900"), 30, gym_id=LVIVSKA, name="Lvivska month"),
        ]
    )

    assert [plan.name for plan in prices.plans_for(TODAY, LVIVSKA)] == [
        "Lvivska month",
        "Month",
        "Year",
        "Student",
    ]
