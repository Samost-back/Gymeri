from decimal import Decimal

import pytest
from django.contrib import admin
from django.db import IntegrityError

from gyms.exceptions import GymNotPublishable, InvalidLocation
from gyms.geo import GeoPoint
from gyms.models import Chain, Gym, Street
from gyms.services import GymPublishingService


def test_point_rejects_latitude_out_of_range():
    with pytest.raises(InvalidLocation):
        GeoPoint(Decimal("95"), Decimal("25.3"))


def test_point_rejects_longitude_out_of_range():
    with pytest.raises(InvalidLocation):
        GeoPoint(Decimal("50.7"), Decimal("-181"))


def test_missing_location_is_none():
    assert GeoPoint.from_optional(None, None) is None


def test_half_a_location_is_rejected():
    with pytest.raises(InvalidLocation):
        GeoPoint.from_optional(Decimal("50.7"), None)


def test_published_gym_needs_a_location():
    with pytest.raises(GymNotPublishable):
        GymPublishingService().validate(is_published=True, latitude=None, longitude=None)


def test_draft_gym_may_have_no_location():
    GymPublishingService().validate(is_published=False, latitude=None, longitude=None)


@pytest.fixture
def chain() -> Chain:
    return Chain.objects.create(name="IA", slug="ia")


@pytest.fixture
def street() -> Street:
    return Street.objects.create(name="просп. Волі", slug="voli")


@pytest.mark.django_db
def test_admin_refuses_to_publish_a_gym_without_location(chain, street, rf, admin_user):
    request = rf.get("/")
    request.user = admin_user
    form_class = admin.site.get_model_admin(Gym).get_form(request)
    form = form_class(
        data={
            "chain": chain.pk,
            "street": street.pk,
            "name": "New",
            "slug": "new",
            "building": "1",
            "is_published": True,
        }
    )

    assert not form.is_valid()
    assert form.errors == {"latitude": ["A published gym needs a map location."]}


@pytest.mark.django_db
def test_database_refuses_a_published_gym_without_location(chain, street):
    # Seeds and the shell skip the admin form; the constraint still holds there.
    with pytest.raises(IntegrityError):
        Gym.objects.create(
            chain=chain, street=street, name="New", slug="new", building="1", is_published=True
        )
