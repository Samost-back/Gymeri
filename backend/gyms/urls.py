from django.urls import path

from .views import CatalogStatsView, ChainListView, FilterOptionsView, GymListView

urlpatterns = [
    path("catalog/stats/", CatalogStatsView.as_view(), name="catalog-stats"),
    path("catalog/filters/", FilterOptionsView.as_view(), name="catalog-filters"),
    path("chains/", ChainListView.as_view(), name="chain-list"),
    path("gyms/", GymListView.as_view(), name="gym-list"),
]
