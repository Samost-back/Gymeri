from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.http import HttpRequest

from .exceptions import EmailTaken, InvalidCredentials, NotSignedIn, WeakPassword
from .models import User


class AuthService:
    """Registration and session sign-in. Takes the request only because the session lives
    on it; the rules don't depend on HTTP."""

    def register(self, request: HttpRequest, email: str, password: str) -> User:
        email = User.objects.normalize_email(email)
        if User.objects.filter(email=email).exists():
            raise EmailTaken
        self._check_strength(password, email)
        try:
            # atomic: a failed insert must not break the request's transaction.
            with transaction.atomic():
                user = User.objects.create_user(email, password)
        except IntegrityError as error:
            # Two sign-ups with one email at the same moment; the database caught the second.
            raise EmailTaken from error
        login(request, user)
        return user

    def login(self, request: HttpRequest, email: str, password: str) -> User:
        # Django's backend hashes the password even for an unknown email, so the response
        # time doesn't tell which emails are registered. It also rejects inactive users.
        user = authenticate(request, email=User.objects.normalize_email(email), password=password)
        if user is None:
            raise InvalidCredentials
        # Replaces the session key, so a key planted before sign-in becomes useless.
        login(request, user)
        return user

    def logout(self, request: HttpRequest) -> None:
        logout(request)

    def current_user(self, request: HttpRequest) -> User:
        if not request.user.is_authenticated:
            raise NotSignedIn
        return request.user

    def _check_strength(self, password: str, email: str) -> None:
        try:
            # The unsaved user lets the similarity check reject passwords built from the email.
            validate_password(password, user=User(email=email))
        except ValidationError as error:
            raise WeakPassword(list(error.messages)) from error
