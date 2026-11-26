from datetime import date
from decimal import Decimal

import pytest

from accounts.models import User
from gyms.models import Chain, Gym, Street
from memberships.models import Membership


@pytest.fixture
def gym() -> Gym:
    chain = Chain.objects.create(name="Interatletyka", slug="interatletyka")
    street = Street.objects.create(name="просп. Волі", slug="voli")
    return Gym.objects.create(
        chain=chain,
        street=street,
        name="Interatletyka Center",
        slug="ia-center",
        building="1",
        latitude=Decimal("50.745126"),
        longitude=Decimal("25.339579"),
        is_published=True,
    )


@pytest.fixture
def ivan() -> User:
    return User.objects.create_user("ivan@example.com", "Gym-pass-2026")


@pytest.fixture
def visit_pack(ivan: User, gym: Gym) -> Membership:
    return Membership.objects.create(
        owner=ivan,
        gym=gym,
        name="12 візитів",
        price=Decimal("700"),
        duration_days=30,
        visits_limit=12,
        starts_on=date(2026, 12, 1),
    )
