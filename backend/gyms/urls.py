from django.urls import path

from .views import CatalogStatsView, ChainListView

urlpatterns = [
    path("catalog/stats/", CatalogStatsView.as_view(), name="catalog-stats"),
    path("chains/", ChainListView.as_view(), name="chain-list"),
]
