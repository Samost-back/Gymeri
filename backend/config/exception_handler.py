from rest_framework import status
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from accounts.exceptions import EmailTaken, InvalidCredentials, NotSignedIn, WeakPassword
from gyms.exceptions import GymNotFound, InvalidFilter

# The single place where domain errors become HTTP responses; services stay HTTP-agnostic.
DOMAIN_ERROR_STATUSES: dict[type[Exception], int] = {
    InvalidFilter: status.HTTP_400_BAD_REQUEST,
    GymNotFound: status.HTTP_404_NOT_FOUND,
    WeakPassword: status.HTTP_400_BAD_REQUEST,
    InvalidCredentials: status.HTTP_401_UNAUTHORIZED,
    NotSignedIn: status.HTTP_401_UNAUTHORIZED,
    EmailTaken: status.HTTP_409_CONFLICT,
}


def exception_handler(exc: Exception, context: dict) -> Response | None:
    for error_type, status_code in DOMAIN_ERROR_STATUSES.items():
        if isinstance(exc, error_type):
            return Response({"detail": str(exc)}, status=status_code)
    if isinstance(exc, Throttled):
        # DRF's own text is half-translated; Retry-After is still set by its handler below.
        wait = f" Спробуйте знову за {exc.wait} с." if exc.wait else ""
        exc.detail = f"Забагато спроб.{wait}"
    return drf_exception_handler(exc, context)
