import pytest
from django.db import IntegrityError

from accounts.models import Role, User

pytestmark = pytest.mark.django_db


def test_new_user_is_a_client_with_a_hashed_password():
    user = User.objects.create_user("ivan@example.com", "Gym-pass-2026")

    assert user.role == Role.CLIENT
    assert user.password.startswith("pbkdf2_sha256$")
    assert "Gym-pass-2026" not in user.password
    assert user.check_password("Gym-pass-2026")


def test_email_is_stored_lowercase():
    user = User.objects.create_user("  Ivan@Example.COM ", "Gym-pass-2026")

    assert user.email == "ivan@example.com"


def test_database_rejects_the_same_email_in_another_case():
    User.objects.create_user("ivan@example.com", "Gym-pass-2026")

    # Bypasses the manager, as an admin form or a raw save could.
    with pytest.raises(IntegrityError):
        User.objects.create(email="IVAN@example.com")


def test_superuser_gets_the_admin_role():
    admin = User.objects.create_superuser("boss@example.com", "Gym-pass-2026")

    assert admin.role == Role.ADMIN
    assert admin.is_staff
    assert admin.is_superuser
