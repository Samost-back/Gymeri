import pytest
from rest_framework.test import APIClient

from accounts.models import User

pytestmark = pytest.mark.django_db

PASSWORD = "Gym-pass-2026"
TWELVE_VISITS = {
    "name": "12 візитів",
    "price": "700.00",
    "duration_days": 30,
    "visits_limit": 12,
    "starts_on": "2026-12-01",
}


@pytest.fixture
def client(ivan) -> APIClient:
    client = APIClient()
    client.force_login(ivan)
    return client


def test_guest_gets_unauthorized():
    assert APIClient().get("/api/v1/my/").status_code == 401


def test_account_starts_empty(client):
    assert client.get("/api/v1/my/").json() == {"gym": None, "memberships": []}


def test_choose_gym_then_add_a_membership(client, gym):
    response = client.put("/api/v1/my/gym/", {"gym": gym.slug}, format="json")
    assert response.status_code == 200
    assert response.json()["gym"]["name"] == gym.name

    response = client.post("/api/v1/my/memberships/", TWELVE_VISITS, format="json")
    assert response.status_code == 201
    assert response.json()["ends_on"] == "2026-12-30"
    assert response.json()["visits_left"] == 12

    assert len(client.get("/api/v1/my/").json()["memberships"]) == 1


def test_cleared_gym_keeps_the_memberships(client, gym, visit_pack):
    client.put("/api/v1/my/gym/", {"gym": gym.slug}, format="json")

    response = client.delete("/api/v1/my/gym/")

    assert response.status_code == 200
    assert response.json()["gym"] is None
    assert [card["id"] for card in response.json()["memberships"]] == [visit_pack.pk]
    # Without a gym there is nowhere to add a new one.
    assert client.post("/api/v1/my/memberships/", TWELVE_VISITS, format="json").status_code == 409


def test_adding_before_choosing_a_gym_is_a_conflict(client):
    response = client.post("/api/v1/my/memberships/", TWELVE_VISITS, format="json")

    assert response.status_code == 409
    assert response.json()["detail"] == "Спершу оберіть свій зал."


@pytest.mark.parametrize(
    "change",
    [
        {"duration_days": 0},
        # A date the calendar can't end on once broke the whole account with a 500.
        {"starts_on": "9999-12-01"},
    ],
)
def test_bad_terms_are_rejected_and_the_account_still_loads(client, gym, change):
    client.put("/api/v1/my/gym/", {"gym": gym.slug}, format="json")

    response = client.post("/api/v1/my/memberships/", {**TWELVE_VISITS, **change}, format="json")

    assert response.status_code == 400
    assert client.get("/api/v1/my/").json()["memberships"] == []


def test_unknown_gym_is_rejected(client):
    response = client.put("/api/v1/my/gym/", {"gym": "nowhere"}, format="json")

    assert response.status_code == 400


def test_own_membership_can_be_deleted(client, visit_pack):
    assert client.delete(f"/api/v1/my/memberships/{visit_pack.pk}/").status_code == 204

    assert client.get("/api/v1/my/").json()["memberships"] == []


def test_someone_elses_membership_is_not_found(visit_pack):
    olena = User.objects.create_user("olena@example.com", PASSWORD)
    client = APIClient()
    client.force_login(olena)

    url = f"/api/v1/my/memberships/{visit_pack.pk}/"
    assert client.delete(url).status_code == 404
    assert client.post(f"{url}visits/today/").status_code == 404


def test_changes_need_a_csrf_token(ivan, gym):
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(ivan)

    response = client.put("/api/v1/my/gym/", {"gym": gym.slug}, format="json")

    assert response.status_code == 403
