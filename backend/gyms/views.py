from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CatalogStatsSerializer, ChainCardSerializer
from .services import CatalogService


class CatalogStatsView(APIView):
    def get(self, request: Request) -> Response:
        stats = CatalogService().get_stats()
        return Response(CatalogStatsSerializer(stats).data)


class ChainListView(APIView):
    def get(self, request: Request) -> Response:
        chains = CatalogService().list_chains()
        return Response(ChainCardSerializer(chains, many=True).data)
