from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

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
def test_promo_filter_lists_only_gyms_with_a_promo_and_describes_it(chain):
    trial = make_plan(chain, "Trial", "500", is_promo=True, promo_ends_on=FAR_FUTURE)
    trial.audiences.set([Audience.objects.create(name="Новачки", slug="newcomers")])
    other = Chain.objects.create(name="Other", slug="other")
    Gym.objects.create(
        chain=other,
        street=Street.objects.get(slug="voli"),
        name="Other",
        slug="other",
        building="2",
        is_published=True,
        latitude=Decimal("50.75"),
        longitude=Decimal("25.33"),
    )
    make_plan(other, "Month", "1350")

    gyms = APIClient().get("/api/v1/gyms/?promo=true").json()

    assert [gym["slug"] for gym in gyms] == ["voli"]
    assert gyms[0]["promo"] == {
        "plan_name": "Trial",
        "price": "500.00",
        "ends_on": FAR_FUTURE.isoformat(),
        "audiences": [{"slug": "newcomers", "name": "Новачки"}],
    }


@pytest.mark.django_db
def test_group_of_an_ended_promo_is_not_offered_as_a_filter(chain):
    yesterday = timezone.localdate() - timedelta(days=1)
    trial = make_plan(chain, "Trial", "500", is_promo=True, promo_ends_on=yesterday)
    trial.audiences.set([Audience.objects.create(name="Новачки", slug="newcomers")])

    options = APIClient().get("/api/v1/catalog/filters/").json()

    assert options["audiences"] == []
