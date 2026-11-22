from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .search import GymSearchCriteria
from .serializers import (
    CatalogStatsSerializer,
    ChainCardSerializer,
    FilterOptionsSerializer,
    GymListingSerializer,
    MapPointSerializer,
)
from .services import CatalogService, GymSearchService


class CatalogStatsView(APIView):
    def get(self, request: Request) -> Response:
        stats = CatalogService().get_stats()
        return Response(CatalogStatsSerializer(stats).data)


class ChainListView(APIView):
    def get(self, request: Request) -> Response:
        chains = CatalogService().list_chains()
        return Response(ChainCardSerializer(chains, many=True).data)


class FilterOptionsView(APIView):
    def get(self, request: Request) -> Response:
        options = CatalogService().get_filter_options()
        return Response(FilterOptionsSerializer(options).data)


class GymListView(APIView):
    def get(self, request: Request) -> Response:
        criteria = GymSearchCriteria.from_query(
            request.query_params, types=request.query_params.getlist("type")
        )
        gyms = GymSearchService().search(criteria)
        return Response(GymListingSerializer(gyms, many=True).data)


class GymMapView(APIView):
    def get(self, request: Request) -> Response:
        points = CatalogService().list_map_points()
        return Response(MapPointSerializer(points, many=True).data)
