import pytest
from django.contrib.auth.models import AnonymousUser
from django.contrib.sessions.backends.db import SessionStore
from django.http import HttpRequest
from django.test import RequestFactory

from accounts.exceptions import EmailTaken, InvalidCredentials, NotSignedIn, WeakPassword
from accounts.models import User
from accounts.services import AuthService

pytestmark = pytest.mark.django_db

PASSWORD = "Gym-pass-2026"


@pytest.fixture
def auth_request() -> HttpRequest:
    request = RequestFactory().post("/")
    request.session = SessionStore()
    request.user = AnonymousUser()
    return request


def test_register_signs_the_new_user_in(auth_request):
    user = AuthService().register(auth_request, "Ivan@Example.com", PASSWORD)

    assert user.email == "ivan@example.com"
    assert AuthService().current_user(auth_request) == user


def test_register_rejects_a_taken_email_in_any_case(auth_request):
    User.objects.create_user("ivan@example.com", PASSWORD)

    with pytest.raises(EmailTaken):
        AuthService().register(auth_request, "IVAN@example.com", PASSWORD)


@pytest.mark.parametrize(
    "password", ["short1", "12345678901", "password123", "ivan.koval@example.com"]
)
def test_register_rejects_weak_passwords(auth_request, password):
    with pytest.raises(WeakPassword):
        AuthService().register(auth_request, "ivan.koval@example.com", password)

    assert not User.objects.exists()


def test_login_accepts_the_email_in_another_case(auth_request):
    user = User.objects.create_user("ivan@example.com", PASSWORD)

    assert AuthService().login(auth_request, "IVAN@example.com", PASSWORD) == user


@pytest.mark.parametrize(
    ("email", "password"),
    [("ivan@example.com", "Wrong-pass-2026"), ("nobody@example.com", PASSWORD)],
)
def test_wrong_password_and_unknown_email_fail_the_same_way(auth_request, email, password):
    User.objects.create_user("ivan@example.com", PASSWORD)

    with pytest.raises(InvalidCredentials):
        AuthService().login(auth_request, email, password)


def test_blocked_user_cannot_sign_in(auth_request):
    User.objects.create_user("ivan@example.com", PASSWORD, is_active=False)

    with pytest.raises(InvalidCredentials):
        AuthService().login(auth_request, "ivan@example.com", PASSWORD)


def test_logout_forgets_the_user(auth_request):
    AuthService().register(auth_request, "ivan@example.com", PASSWORD)

    AuthService().logout(auth_request)

    with pytest.raises(NotSignedIn):
        AuthService().current_user(auth_request)
