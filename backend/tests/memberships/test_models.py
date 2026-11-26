from datetime import date

import pytest
from django.db import IntegrityError
from django.db.models import ProtectedError

from memberships.models import HomeGym, Membership, Visit

pytestmark = pytest.mark.django_db


def test_database_rejects_a_second_visit_on_the_same_day(visit_pack):
    Visit.objects.create(membership=visit_pack, day=date(2026, 12, 1))

    with pytest.raises(IntegrityError):
        Visit.objects.create(membership=visit_pack, day=date(2026, 12, 1))


@pytest.mark.parametrize("field", [{"duration_days": 0}, {"visits_limit": 0}, {"price": -1}])
def test_database_rejects_impossible_terms(visit_pack, field):
    with pytest.raises(IntegrityError):
        Membership.objects.filter(pk=visit_pack.pk).update(**field)


def test_a_client_has_one_home_gym(ivan, gym):
    HomeGym.objects.create(user=ivan, gym=gym)

    with pytest.raises(IntegrityError):
        HomeGym.objects.create(user=ivan, gym=gym)


def test_a_gym_with_client_memberships_cannot_be_deleted(visit_pack, gym):
    with pytest.raises(ProtectedError):
        gym.delete()
