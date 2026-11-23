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
    Discount,
    Gym,
    GymPhoto,
    GymType,
    MembershipPlan,
    OpeningHours,
    PlanAccessWindow,
    Street,
)
from .services import GymPublishingService, PlanPricingService


@admin.register(Street, GymType, Audience)
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


class DiscountFormSet(forms.BaseInlineFormSet):
    def clean(self) -> None:
        super().clean()
        # The plan already carries the price from this same save, so a price change and
        # a new discount are checked together.
        price = self.instance.price
        for form in self.forms:
            data = getattr(form, "cleaned_data", None)
            if not data or data.get("DELETE") or not form.has_changed() or price is None:
                continue
            # A field that failed its own validation already shows an error.
            if not all(key in data for key in ("kind", "value", "ends_on")):
                continue
            try:
                PlanPricingService().validate_discount(
                    price=price,
                    kind=data["kind"],
                    value=data["value"],
                    ends_on=data["ends_on"],
                    today=timezone.localdate(),
                )
            except GymsError as error:
                form.add_error("value", str(error))


class DiscountInline(admin.TabularInline):
    model = Discount
    formset = DiscountFormSet
    extra = 0


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    # Separate page because Django can't nest access windows inside the chain page.
    list_display = ["name", "chain", "gym", "price", "duration_days", "is_active"]
    list_filter = ["chain", "is_active", "audiences"]
    list_select_related = ["chain", "gym"]
    filter_horizontal = ["audiences"]
    inlines = [PlanAccessWindowInline, DiscountInline]
