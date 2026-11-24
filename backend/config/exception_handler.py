from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from gyms.exceptions import GymNotFound, InvalidFilter

# The single place where domain errors become HTTP responses; services stay HTTP-agnostic.
DOMAIN_ERROR_STATUSES: dict[type[Exception], int] = {
    InvalidFilter: status.HTTP_400_BAD_REQUEST,
    GymNotFound: status.HTTP_404_NOT_FOUND,
}


def exception_handler(exc: Exception, context: dict) -> Response | None:
    for error_type, status_code in DOMAIN_ERROR_STATUSES.items():
        if isinstance(exc, error_type):
            return Response({"detail": str(exc)}, status=status_code)
    return drf_exception_handler(exc, context)
