from datetime import date
from decimal import Decimal

import pytest
from django.contrib import admin

from gyms.admin import MembershipPlanAdmin
from gyms.models import Chain, MembershipPlan


@pytest.fixture
def chain() -> Chain:
    return Chain.objects.create(name="IA", slug="ia")


def make_plan(chain: Chain, name: str, **fields) -> MembershipPlan:
    return MembershipPlan.objects.create(
        chain=chain, name=name, price=Decimal("1000"), duration_days=30, **fields
    )


def plan_form(plan: MembershipPlan, rf, admin_user, **changes):
    request = rf.post("/")
    request.user = admin_user
    form_class = MembershipPlanAdmin(MembershipPlan, admin.site).get_form(request, plan)
    data = {
        "chain": plan.chain_id,
        "name": plan.name,
        "price": plan.price,
        "duration_days": plan.duration_days,
        "is_active": plan.is_active,
        "is_promo": plan.is_promo,
        "promo_ends_on": plan.promo_ends_on or "",
    } | changes
    return form_class(data=data, instance=plan)


@pytest.mark.django_db
def test_admin_refuses_a_new_promo_that_already_ended(chain, rf, admin_user):
    plan = make_plan(chain, "Month")

    form = plan_form(plan, rf, admin_user, is_promo=True, promo_ends_on="2020-01-01")

    assert not form.is_valid()
    assert form.errors["promo_ends_on"] == ["A promo can't end in the past."]


@pytest.mark.django_db
def test_admin_still_saves_an_ended_promo_when_its_dates_stay(chain, rf, admin_user):
    plan = make_plan(chain, "Old promo", is_promo=True, promo_ends_on=date(2020, 1, 1))

    form = plan_form(plan, rf, admin_user, is_active=False)

    assert form.is_valid(), form.errors
