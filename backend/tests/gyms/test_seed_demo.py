import pytest
from django.core.management import call_command

from gyms.models import Chain, Gym, MembershipPlan, OpeningHours
from gyms.search import GymSearchCriteria
from gyms.services import GymSearchService


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


@pytest.mark.django_db
def test_seed_keeps_the_promo_badge_rare():
    call_command("seed_demo")

    gyms = GymSearchService().search(GymSearchCriteria.from_query({}, types=[]))

    # A badge on almost every card says nothing; the demo shows it where a promo really runs.
    with_promo = [gym.slug for gym in gyms if gym.promo]
    assert 0 < len(with_promo) < len(gyms) / 2
