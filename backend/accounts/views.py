from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CredentialsSerializer, UserSerializer
from .services import AuthService
from .throttles import ClientThrottle, LoginEmailThrottle


class CsrfView(APIView):
    """Sets the CSRF cookie the frontend sends back as a header on every POST."""

    @method_decorator(ensure_csrf_cookie)
    def get(self, request: Request) -> Response:
        return Response(status=status.HTTP_204_NO_CONTENT)


# DRF checks CSRF only for signed-in users; without this a foreign site could sign a
# visitor into an attacker's account.
@method_decorator(csrf_protect, name="dispatch")
class RegisterView(APIView):
    # Per client: every attempt costs a slow password hash, so a flood could stall the server.
    throttle_classes = [ClientThrottle]

    def post(self, request: Request) -> Response:
        credentials = CredentialsSerializer(data=request.data)
        credentials.is_valid(raise_exception=True)
        user = AuthService().register(request, **credentials.validated_data)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    throttle_classes = [ClientThrottle, LoginEmailThrottle]

    def post(self, request: Request) -> Response:
        credentials = CredentialsSerializer(data=request.data)
        credentials.is_valid(raise_exception=True)
        user = AuthService().login(request, **credentials.validated_data)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    def post(self, request: Request) -> Response:
        AuthService().logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    def get(self, request: Request) -> Response:
        user = AuthService().current_user(request)
        return Response(UserSerializer(user).data)
