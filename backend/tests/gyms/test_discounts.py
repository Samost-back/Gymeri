from datetime import date
from decimal import Decimal

import pytest
from django.contrib import admin

from gyms.admin import DiscountInline
from gyms.discounts import FixedDiscount, PercentDiscount, make_discount
from gyms.exceptions import InvalidDiscount
from gyms.models import Chain, MembershipPlan
from gyms.services import PlanPricingService

ENDS = date(2026, 12, 1)


def test_percent_discount_rounds_to_kopecks():
    assert PercentDiscount(ENDS, Decimal("15")).apply(Decimal("999")) == Decimal("849.15")


def test_percent_over_100_is_rejected():
    with pytest.raises(InvalidDiscount):
        PercentDiscount(ENDS, Decimal("120"))


def test_fixed_discount_must_stay_below_the_price():
    with pytest.raises(InvalidDiscount):
        FixedDiscount(ENDS, Decimal("1500")).apply(Decimal("1500"))


def test_discount_works_through_its_last_day():
    discount = FixedDiscount(ENDS, Decimal("100"))

    assert discount.is_active(ENDS)
    assert not discount.is_active(date(2026, 12, 2))


def test_factory_picks_the_class_by_kind():
    assert isinstance(make_discount("percent", Decimal("10"), ENDS), PercentDiscount)
    with pytest.raises(InvalidDiscount):
        make_discount("bonus", Decimal("10"), ENDS)


def test_new_discount_cant_end_in_the_past():
    with pytest.raises(InvalidDiscount):
        PlanPricingService().validate_discount(
            price=Decimal("1000"),
            kind="percent",
            value=Decimal("10"),
            ends_on=date(2026, 11, 1),
            today=date(2026, 11, 23),
        )


@pytest.mark.django_db
def test_admin_refuses_a_fixed_discount_bigger_than_the_price(rf, admin_user):
    chain = Chain.objects.create(name="IA", slug="ia")
    plan = MembershipPlan.objects.create(
        chain=chain, name="Month", price=Decimal("1000"), duration_days=30
    )
    request = rf.get("/")
    request.user = admin_user
    inline = DiscountInline(MembershipPlan, admin.site)
    formset = inline.get_formset(request, plan)(
        data={
            "discounts-TOTAL_FORMS": "1",
            "discounts-INITIAL_FORMS": "0",
            "discounts-0-kind": "fixed",
            "discounts-0-value": "1500",
            "discounts-0-ends_on": "2099-01-01",
        },
        instance=plan,
        prefix="discounts",
    )

    assert not formset.is_valid()
    assert formset.errors[0]["value"] == ["A discount of 1500 doesn't fit the price 1000."]
