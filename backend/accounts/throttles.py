import hashlib

from rest_framework.request import Request
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from .models import User


class ClientThrottle(SimpleRateThrottle):
    """Limits sign-in and sign-up attempts per client address. DRF's ScopedRateThrottle counts
    a signed-in user by id instead, and sign-up signs every new account in, so each attempt
    would start a fresh counter."""

    scope = "auth"

    def get_cache_key(self, request: Request, view: APIView) -> str:
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class LoginEmailThrottle(SimpleRateThrottle):
    """Limits sign-in attempts per account, whatever address they come from, so a password
    can't be guessed by spreading attempts over many IPs.

    The cost: someone who knows an email can lock its owner out until the window passes.
    An hour keeps guessing slow while the lockout stays short-lived; an account limit can't
    tell the owner from an attacker, so either way one of them waits."""

    scope = "login_email"

    def get_cache_key(self, request: Request, view: APIView) -> str | None:
        email = request.data.get("email")
        if not isinstance(email, str) or not email:
            # Nothing to count: the serializer rejects such a request without checking a password.
            return None
        normalized = User.objects.normalize_email(email)
        # Hashed so the cache holds no emails and the key is always short and safe.
        ident = hashlib.sha256(normalized.encode()).hexdigest()
        return self.cache_format % {"scope": self.scope, "ident": ident}
