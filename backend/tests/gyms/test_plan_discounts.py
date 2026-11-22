from datetime import date
from decimal import Decimal

from gyms.discounts import FixedDiscount, PercentDiscount
from gyms.pricing import PlanPrice, PriceList

TODAY = date(2026, 11, 23)
LATER = date(2026, 12, 31)


def monthly(price: str, *discounts) -> PlanPrice:
    return PlanPrice(Decimal(price), 30, discounts=tuple(discounts))


def test_active_discount_lowers_the_from_price():
    prices = PriceList([monthly("1000", PercentDiscount(LATER, Decimal("20")))])

    assert prices.monthly_from(TODAY) == Decimal("800.00")
    assert prices.best_offer(TODAY) is not None


def test_expired_discount_is_ignored():
    prices = PriceList([monthly("1000", PercentDiscount(date(2026, 11, 1), Decimal("20")))])

    assert prices.monthly_from(TODAY) == Decimal("1000")
    assert prices.best_offer(TODAY) is None


def test_the_best_of_two_discounts_wins():
    plan = monthly(
        "1000", PercentDiscount(LATER, Decimal("10")), FixedDiscount(LATER, Decimal("300"))
    )

    assert plan.price_on(TODAY) == Decimal("700")


def test_discount_that_no_longer_fits_the_price_is_skipped():
    # The plan got cheaper after the promo was set up.
    plan = monthly("300", FixedDiscount(LATER, Decimal("400")))

    assert plan.price_on(TODAY) == Decimal("300")
    assert plan.best_offer_on(TODAY) is None


def test_card_shows_the_offer_that_saves_the_most():
    prices = PriceList(
        [
            PlanPrice(Decimal("1000"), 30, discounts=(PercentDiscount(LATER, Decimal("20")),)),
            PlanPrice(
                Decimal("12000"),
                365,
                discounts=(PercentDiscount(LATER, Decimal("10")),),
                name="Річний",
            ),
        ]
    )

    offer = prices.best_offer(TODAY)

    assert offer is not None
    assert (offer.plan_name, offer.saving) == ("Річний", Decimal("1200.00"))
