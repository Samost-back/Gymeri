from typing import Any

from django import forms
from django.contrib import admin
from django.db.models import Count, QuerySet
from django.http import HttpRequest

from .exceptions import GymsError
from .models import (
    Amenity,
    Chain,
    District,
    Gym,
    GymPhoto,
    MembershipPlan,
    OpeningHours,
    PlanAccessWindow,
)
from .services import GymPublishingService


@admin.register(District, Amenity)
class DictionaryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ["name"]}


class ChainPlanInline(admin.TabularInline):
    model = MembershipPlan
    fields = ["name", "price", "duration_days", "visits_limit", "gym", "is_active"]
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
    list_display = ["name", "chain", "district", "is_published"]
    list_filter = ["is_published", "chain", "district"]
    list_select_related = ["chain", "district"]
    search_fields = ["name", "address"]
    prepopulated_fields = {"slug": ["name"]}
    filter_horizontal = ["amenities"]
    inlines = [OpeningHoursInline, GymPhotoInline]


class PlanAccessWindowInline(admin.TabularInline):
    model = PlanAccessWindow
    extra = 0
    max_num = 7


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    # Separate page because Django can't nest access windows inside the chain page.
    list_display = ["name", "chain", "gym", "price", "duration_days", "is_active"]
    list_filter = ["chain", "is_active"]
    list_select_related = ["chain", "gym"]
    inlines = [PlanAccessWindowInline]
