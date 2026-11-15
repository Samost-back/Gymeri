import pytest
from django.core.management import call_command

from gyms.models import Chain, Gym, MembershipPlan, OpeningHours


@pytest.mark.django_db
def test_seed_publishes_only_confirmed_gyms():
    call_command("seed_demo")

    published = Gym.objects.filter(is_published=True)
    assert published.count() == 5
    assert set(published.values_list("chain__slug", flat=True)) == {"inter-atletyka"}


@pytest.mark.django_db
def test_seed_can_run_twice_without_duplicates():
    call_command("seed_demo")
    counts = [m.objects.count() for m in (Chain, Gym, MembershipPlan, OpeningHours)]

    call_command("seed_demo")

    assert [m.objects.count() for m in (Chain, Gym, MembershipPlan, OpeningHours)] == counts
