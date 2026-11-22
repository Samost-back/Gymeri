from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from gyms.models import Chain, Gym, Street


@pytest.fixture
def chain() -> Chain:
    return Chain.objects.create(name="IA", slug="ia", website="https://ia.example")


@pytest.fixture
def street() -> Street:
    return Street.objects.create(name="просп. Волі", slug="voli")


def make_gym(chain: Chain, street: Street, slug: str, **fields) -> Gym:
    return Gym.objects.create(
        chain=chain, street=street, name=slug, slug=slug, building="42", **fields
    )


@pytest.mark.django_db
def test_map_lists_only_published_gyms(chain, street):
    location = {"latitude": Decimal("50.745126"), "longitude": Decimal("25.339579")}
    make_gym(chain, street, "on-map", is_published=True, **location)
    make_gym(chain, street, "draft", is_published=False, **location)

    response = APIClient().get("/api/v1/gyms/map/")

    assert response.status_code == 200
    assert response.json() == [
        {
            "slug": "on-map",
            "name": "on-map",
            "chain_name": "IA",
            "website": "https://ia.example",
            "instagram_url": "",
            "address": "просп. Волі, 42",
            "latitude": 50.745126,
            "longitude": 25.339579,
        }
    ]
