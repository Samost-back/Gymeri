from typing import Any

from django import forms
from django.contrib import admin
from django.db.models import Count, QuerySet
from django.http import HttpRequest
from django.utils import timezone

from .exceptions import GymsError
from .models import (
    Audience,
    Chain,
    Gym,
    GymPhoto,
    GymType,
    MembershipPlan,
    OpeningHours,
    PlanAccessWindow,
    Street,
)
from .services import GymPublishingService, PlanPromoService


@admin.register(Street, GymType, Audience)
class DictionaryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ["name"]}


class PlanAdminForm(forms.ModelForm):
    """Shared by the chain page and the plan page, so a promo is checked wherever it's edited."""

    def clean(self) -> dict[str, Any]:
        data = super().clean()
        # Only on change: an old promo that has ended must stay editable, e.g. to switch it off.
        if not {"is_promo", "promo_ends_on"} & set(self.changed_data):
            return data
        try:
            PlanPromoService().validate(
                is_promo=data.get("is_promo", False),
                promo_ends_on=data.get("promo_ends_on"),
                today=timezone.localdate(),
            )
        except GymsError as error:
            # On the field, so Django skips the matching database constraint and its raw name.
            raise forms.ValidationError({"promo_ends_on": str(error)}) from error
        return data


class ChainPlanInline(admin.TabularInline):
    model = MembershipPlan
    form = PlanAdminForm
    fields = [
        "name",
        "price",
        "duration_days",
        "visits_limit",
        "gym",
        "is_promo",
        "promo_ends_on",
        "is_active",
    ]
    extra = 0
    show_change_link = True


@admin.register(Chain)
class ChainAdmin(admin.ModelAdmin):
    list_display = ["name", "short_name", "gyms_count"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}
    inlines = [ChainPlanInline]

    def get_queryset(self, request: HttpRequest) -> QuerySet[Chain]:
        # One query with a count instead of a query per row.
        return super().get_queryset(request).annotate(gyms_count=Count("gyms"))

    @admin.display(description="gyms", ordering="gyms_count")
    def gyms_count(self, chain: Chain) -> int:
        return chain.gyms_count


class OpeningHoursInline(admin.TabularInline):
    model = OpeningHours
    extra = 0
    max_num = 7


class GymPhotoInline(admin.TabularInline):
    model = GymPhoto
    extra = 0


class GymAdminForm(forms.ModelForm):
    """Model and fields come from GymAdmin, so new Gym fields show up without editing this."""

    def clean(self) -> dict[str, Any]:
        data = super().clean()
        try:
            GymPublishingService().validate(
                is_published=data.get("is_published", False),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
            )
        except GymsError as error:
            # On the field, not the form: Django then skips the matching database constraints,
            # so the user sees this one message instead of it plus a raw constraint name.
            raise forms.ValidationError({"latitude": str(error)}) from error
        return data


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    form = GymAdminForm
    list_display = ["name", "chain", "street", "is_published"]
    list_filter = ["is_published", "chain", "street"]
    list_select_related = ["chain", "street"]
    search_fields = ["name", "street__name"]
    prepopulated_fields = {"slug": ["name"]}
    filter_horizontal = ["types"]
    inlines = [OpeningHoursInline, GymPhotoInline]


class PlanAccessWindowInline(admin.TabularInline):
    model = PlanAccessWindow
    extra = 0
    max_num = 7


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    # Separate page because Django can't nest access windows inside the chain page.
    form = PlanAdminForm
    list_display = ["name", "chain", "gym", "price", "duration_days", "is_promo", "is_active"]
    list_filter = ["chain", "is_active", "is_promo", "audiences"]
    list_select_related = ["chain", "gym"]
    filter_horizontal = ["audiences"]
    inlines = [PlanAccessWindowInline]
