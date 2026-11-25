from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.services import AuthService

from .serializers import (
    AccountSerializer,
    ChooseGymSerializer,
    MembershipCardSerializer,
    NewMembershipSerializer,
)
from .services import MembershipService, Terms

# Every view starts with current_user: a guest gets 401 from the accounts service, and the
# membership service only ever sees the signed-in owner.


class AccountView(APIView):
    def get(self, request: Request) -> Response:
        user = AuthService().current_user(request)
        account = MembershipService().get_account(user)
        return Response(AccountSerializer(account).data)


class HomeGymView(APIView):
    def put(self, request: Request) -> Response:
        user = AuthService().current_user(request)
        choice = ChooseGymSerializer(data=request.data)
        choice.is_valid(raise_exception=True)
        service = MembershipService()
        service.choose_gym(user, choice.validated_data["gym"])
        return Response(AccountSerializer(service.get_account(user)).data)

    def delete(self, request: Request) -> Response:
        user = AuthService().current_user(request)
        service = MembershipService()
        service.clear_gym(user)
        return Response(AccountSerializer(service.get_account(user)).data)


class MembershipListView(APIView):
    def post(self, request: Request) -> Response:
        user = AuthService().current_user(request)
        data = NewMembershipSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        starts_on = data.validated_data.pop("starts_on")
        card = MembershipService().add(user, Terms(**data.validated_data), starts_on)
        return Response(MembershipCardSerializer(card).data, status=status.HTTP_201_CREATED)


class MembershipDetailView(APIView):
    def delete(self, request: Request, membership_id: int) -> Response:
        user = AuthService().current_user(request)
        MembershipService().delete(user, membership_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TodayVisitView(APIView):
    """Today's visit of one membership: POST marks it, DELETE takes a mistaken one back."""

    def post(self, request: Request, membership_id: int) -> Response:
        user = AuthService().current_user(request)
        card = MembershipService().record_visit(user, membership_id)
        return Response(MembershipCardSerializer(card).data, status=status.HTTP_201_CREATED)

    def delete(self, request: Request, membership_id: int) -> Response:
        user = AuthService().current_user(request)
        card = MembershipService().cancel_visit(user, membership_id)
        return Response(MembershipCardSerializer(card).data)
