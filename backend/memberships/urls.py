from django.urls import path

from .views import (
    AccountView,
    HomeGymView,
    MembershipDetailView,
    MembershipListView,
    TodayVisitView,
)

urlpatterns = [
    path("my/", AccountView.as_view(), name="my-account"),
    path("my/gym/", HomeGymView.as_view(), name="my-gym"),
    path("my/memberships/", MembershipListView.as_view(), name="my-memberships"),
    path(
        "my/memberships/<int:membership_id>/",
        MembershipDetailView.as_view(),
        name="my-membership",
    ),
    path(
        "my/memberships/<int:membership_id>/visits/today/",
        TodayVisitView.as_view(),
        name="my-membership-visit-today",
    ),
]
