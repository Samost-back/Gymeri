from decimal import Decimal

from gyms.pricing import PlanPrice, PriceList

LVIVSKA = 1
VOLI = 2


def price_list() -> PriceList:
    return PriceList(
        [
            PlanPrice(Decimal("1350"), 30),
            PlanPrice(Decimal("900"), 30, gym_id=LVIVSKA),
            PlanPrice(Decimal("500"), 365),
        ]
    )


def test_gym_price_counts_chain_plans_and_its_own():
    assert price_list().monthly_from(LVIVSKA) == Decimal("900")


def test_gym_price_ignores_plans_of_other_gyms():
    assert price_list().monthly_from(VOLI) == Decimal("1350")


def test_chain_price_counts_every_monthly_plan():
    assert price_list().monthly_from() == Decimal("900")


def test_no_monthly_plans_means_no_price():
    assert PriceList([PlanPrice(Decimal("11800"), 365)]).monthly_from() is None
