from typing import Any

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.functions import Lower


class Role(models.TextChoices):
    CLIENT = "client", "Клієнт"
    TRAINER = "trainer", "Тренер"
    GYM_OWNER = "gym_owner", "Власник залу"
    ADMIN = "admin", "Адміністратор"


class UserManager(BaseUserManager["User"]):
    """Creates users by email; Django's default manager expects a username."""

    use_in_migrations = True

    @classmethod
    def normalize_email(cls, email: str | None) -> str:
        # The whole address, not just the domain: people don't remember which letters they
        # capitalised, and Ivan@ and ivan@ must not become two accounts.
        return (email or "").strip().lower()

    def create_user(self, email: str, password: str | None = None, **extra: Any) -> "User":
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email), **extra)
        # Stores a salted PBKDF2 hash, never the password itself.
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra: Any) -> "User":
        extra.update(is_staff=True, is_superuser=True, role=Role.ADMIN)
        return self.create_user(email, password, **extra)


class User(AbstractUser):
    """A person who signs in with email.

    role is what they are on the platform (client, trainer...); access to Django admin is
    decided only by is_staff/is_superuser, so the two never have to be kept in sync."""

    username = None
    first_name = None
    last_name = None
    email = models.EmailField("email", unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        constraints = [
            # Guards case-insensitive uniqueness in the database too, for rows that bypass
            # the manager (admin, raw updates).
            models.UniqueConstraint(Lower("email"), name="user_email_ci_unique"),
        ]

    def __str__(self) -> str:
        return self.email
