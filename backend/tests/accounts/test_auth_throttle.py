import pytest
from rest_framework.test import APIClient
from rest_framework.throttling import SimpleRateThrottle

from accounts.models import User

pytestmark = pytest.mark.django_db

PASSWORD = "Gym-pass-2026"
WRONG = {"email": "ivan@example.com", "password": "Wrong-pass-2026"}


@pytest.fixture(autouse=True)
def low_limits(monkeypatch):
    # Real limits would need dozens of slow password checks per test.
    monkeypatch.setitem(SimpleRateThrottle.THROTTLE_RATES, "auth", "3/minute")
    monkeypatch.setitem(SimpleRateThrottle.THROTTLE_RATES, "login_email", "2/hour")


@pytest.fixture(autouse=True)
def ivan() -> User:
    return User.objects.create_user("ivan@example.com", PASSWORD)


def login(data: dict[str, str], ip: str = "10.0.0.1", **headers: str) -> int:
    return APIClient().post("/api/v1/auth/login/", data, REMOTE_ADDR=ip, **headers).status_code


def test_account_is_locked_after_too_many_attempts_even_with_the_right_password():
    assert login(WRONG) == 401
    assert login(WRONG) == 401

    # Another address, so only the account limit can stop it.
    response = APIClient().post(
        "/api/v1/auth/login/",
        {"email": "ivan@example.com", "password": PASSWORD},
        REMOTE_ADDR="10.0.0.2",
    )

    assert response.status_code == 429
    assert response.json()["detail"].startswith("Забагато спроб.")
    assert "Retry-After" in response.headers


def test_changing_address_or_letter_case_does_not_reset_the_account_limit():
    assert login(WRONG, ip="10.0.0.1") == 401
    assert login({**WRONG, "email": "IVAN@example.com"}, ip="10.0.0.2") == 401

    assert login(WRONG, ip="10.0.0.3") == 429


def test_one_locked_account_does_not_block_others():
    login(WRONG)
    login(WRONG)

    assert login({"email": "olena@example.com", "password": PASSWORD}, ip="10.0.0.9") == 401


def test_one_client_is_limited_across_accounts():
    for number in range(3):
        login({"email": f"user{number}@example.com", "password": PASSWORD})

    assert login({"email": "user3@example.com", "password": PASSWORD}) == 429
    assert login({"email": "user3@example.com", "password": PASSWORD}, ip="10.0.0.2") == 401


def test_faked_forwarded_for_header_does_not_dodge_the_client_limit():
    for number in range(3):
        login(
            {"email": f"user{number}@example.com", "password": PASSWORD},
            HTTP_X_FORWARDED_FOR=f"6.6.6.{number}",
        )

    blocked = login(
        {"email": "user3@example.com", "password": PASSWORD}, HTTP_X_FORWARDED_FOR="6.6.6.9"
    )

    assert blocked == 429


def test_registration_is_limited_per_client():
    client = APIClient()
    for number in range(3):
        client.post(
            "/api/v1/auth/register/", {"email": f"new{number}@example.com", "password": PASSWORD}
        )

    response = client.post(
        "/api/v1/auth/register/", {"email": "new3@example.com", "password": PASSWORD}
    )

    assert response.status_code == 429
