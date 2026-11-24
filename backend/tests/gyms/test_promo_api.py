from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.contrib import admin
from django.utils import timezone
from rest_framework.test import APIClient

from gyms.admin import MembershipPlanAdmin
from gyms.models import Audience, Chain, Gym, MembershipPlan, Street

FAR_FUTURE = date(2099, 1, 1)


@pytest.fixture
def chain() -> Chain:
    chain = Chain.objects.create(name="IA", slug="ia")
    Gym.objects.create(
        chain=chain,
        street=Street.objects.create(name="просп. Волі", slug="voli"),
        name="Voli",
        slug="voli",
        building="1",
        is_published=True,
        latitude=Decimal("50.75"),
        longitude=Decimal("25.33"),
    )
    return chain


def make_plan(chain: Chain, name: str, price: str, days: int = 30, **fields) -> MembershipPlan:
    return MembershipPlan.objects.create(
        chain=chain, name=name, price=Decimal(price), duration_days=days, **fields
    )


@pytest.mark.django_db
def test_gym_listing_describes_its_promo(chain):
    make_plan(chain, "Month", "1350")
    make_plan(chain, "3 months for 1500", "1500", days=90, is_promo=True, promo_ends_on=FAR_FUTURE)

    [gym] = APIClient().get("/api/v1/gyms/?promo=true").json()

    assert gym["promo"] == {
        "plan_name": "3 months for 1500",
        "price": "1500.00",
        "ends_on": FAR_FUTURE.isoformat(),
    }


@pytest.mark.django_db
def test_group_of_an_ended_promo_is_not_offered_as_a_filter(chain):
    yesterday = timezone.localdate() - timedelta(days=1)
    trial = make_plan(chain, "Trial", "500", is_promo=True, promo_ends_on=yesterday)
    trial.audiences.set([Audience.objects.create(name="Новачки", slug="newcomers")])

    options = APIClient().get("/api/v1/catalog/filters/").json()

    assert options["audiences"] == []


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
    plan = make_plan(chain, "Month", "1000")

    form = plan_form(plan, rf, admin_user, is_promo=True, promo_ends_on="2020-01-01")

    assert not form.is_valid()
    assert form.errors["promo_ends_on"] == ["A promo can't end in the past."]


@pytest.mark.django_db
def test_admin_still_saves_an_ended_promo_when_its_dates_stay(chain, rf, admin_user):
    plan = make_plan(chain, "Old promo", "1000", is_promo=True, promo_ends_on=date(2020, 1, 1))

    form = plan_form(plan, rf, admin_user, is_active=False)

    assert form.is_valid(), form.errors
