import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import override_settings

from memberships.models import Membership

pytestmark = pytest.mark.django_db


@override_settings(DEBUG=True)
def test_demo_client_gets_two_different_memberships_on_every_run():
    call_command("seed_demo")
    call_command("seed_demo_client")
    call_command("seed_demo_client")

    memberships = Membership.objects.filter(owner__email="demo@gymeri.local")
    assert sorted(memberships.values_list("visits_limit", flat=True), key=str) == [12, None]


@override_settings(DEBUG=False)
def test_demo_client_is_refused_outside_debug():
    with pytest.raises(CommandError):
        call_command("seed_demo_client")
