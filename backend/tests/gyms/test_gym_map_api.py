from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from gyms.models import Chain, District, Gym


@pytest.fixture
def chain() -> Chain:
    return Chain.objects.create(name="IA", slug="ia", website="https://ia.example")


@pytest.fixture
def district() -> District:
    return District.objects.create(name="Центр", slug="center")


def make_gym(chain: Chain, district: District, slug: str, **fields) -> Gym:
    return Gym.objects.create(
        chain=chain, district=district, name=slug, slug=slug, address="x", **fields
    )


@pytest.mark.django_db
def test_map_lists_only_published_gyms(chain, district):
    location = {"latitude": Decimal("50.745126"), "longitude": Decimal("25.339579")}
    make_gym(chain, district, "on-map", is_published=True, **location)
    make_gym(chain, district, "draft", is_published=False, **location)

    response = APIClient().get("/api/v1/gyms/map/")

    assert response.status_code == 200
    assert response.json() == [
        {
            "slug": "on-map",
            "name": "on-map",
            "chain_name": "IA",
            "website": "https://ia.example",
            "instagram_url": "",
            "address": "x",
            "latitude": 50.745126,
            "longitude": 25.339579,
        }
    ]
