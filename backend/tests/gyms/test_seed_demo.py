import pytest
from django.core.management import call_command

from gyms.models import Chain, Gym, MembershipPlan, OpeningHours


@pytest.mark.django_db
def test_seed_publishes_only_gyms_with_demo_data():
    call_command("seed_demo")

    published = Gym.objects.filter(is_published=True)
    assert published.count() == 7
    assert set(published.values_list("chain__slug", flat=True)) == {
        "interatletika",
        "lime-fit-club",
        "sport-life",
    }


@pytest.mark.django_db
def test_seed_can_run_twice_without_duplicates():
    call_command("seed_demo")
    counts = [m.objects.count() for m in (Chain, Gym, MembershipPlan, OpeningHours)]

    call_command("seed_demo")

    assert [m.objects.count() for m in (Chain, Gym, MembershipPlan, OpeningHours)] == counts
