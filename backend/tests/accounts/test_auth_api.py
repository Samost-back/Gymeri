import pytest
from rest_framework.test import APIClient

from accounts.models import User

pytestmark = pytest.mark.django_db

PASSWORD = "Gym-pass-2026"
CREDENTIALS = {"email": "ivan@example.com", "password": PASSWORD}


@pytest.fixture
def client() -> APIClient:
    # APIClient skips CSRF by default; the real browser flow doesn't.
    return APIClient(enforce_csrf_checks=True)


def csrf_headers(client: APIClient) -> dict[str, str]:
    client.get("/api/v1/auth/csrf/")
    return {"HTTP_X_CSRFTOKEN": client.cookies["csrftoken"].value}


def test_register_returns_the_user_and_starts_a_session(client):
    response = client.post("/api/v1/auth/register/", CREDENTIALS, **csrf_headers(client))

    assert response.status_code == 201
    assert response.json()["email"] == "ivan@example.com"
    assert response.json()["role"] == "client"
    assert "password" not in response.json()
    assert client.get("/api/v1/auth/me/").json()["email"] == "ivan@example.com"


def test_session_cookie_is_hidden_from_scripts(client):
    response = client.post("/api/v1/auth/register/", CREDENTIALS, **csrf_headers(client))

    assert response.cookies["sessionid"]["httponly"]


def test_register_with_a_taken_email_is_a_conflict(client):
    User.objects.create_user("ivan@example.com", PASSWORD)

    response = client.post("/api/v1/auth/register/", CREDENTIALS, **csrf_headers(client))

    assert response.status_code == 409


def test_weak_password_comes_back_with_the_reason(client):
    response = client.post(
        "/api/v1/auth/register/",
        {"email": "ivan@example.com", "password": "12345678"},
        **csrf_headers(client),
    )

    assert response.status_code == 400
    assert response.json()["detail"]


def test_malformed_email_is_rejected_before_the_service(client):
    response = client.post(
        "/api/v1/auth/register/",
        {"email": "not-an-email", "password": PASSWORD},
        **csrf_headers(client),
    )

    assert response.status_code == 400
    assert "email" in response.json()


def test_login_with_a_wrong_password_is_unauthorized(client):
    User.objects.create_user("ivan@example.com", PASSWORD)

    response = client.post(
        "/api/v1/auth/login/",
        {"email": "ivan@example.com", "password": "Wrong-pass-2026"},
        **csrf_headers(client),
    )

    assert response.status_code == 401


def test_login_then_logout(client):
    User.objects.create_user("ivan@example.com", PASSWORD)
    headers = csrf_headers(client)

    assert client.post("/api/v1/auth/login/", CREDENTIALS, **headers).status_code == 200
    # Sign-in rotates the CSRF token, so the next POST needs a fresh one.
    assert client.post("/api/v1/auth/logout/", **csrf_headers(client)).status_code == 204
    assert client.get("/api/v1/auth/me/").status_code == 401


def test_post_without_a_csrf_token_is_forbidden(client):
    User.objects.create_user("ivan@example.com", PASSWORD)

    response = client.post("/api/v1/auth/login/", CREDENTIALS)

    assert response.status_code == 403
    assert "sessionid" not in client.cookies


def test_me_without_a_session_is_unauthorized(client):
    assert client.get("/api/v1/auth/me/").status_code == 401
