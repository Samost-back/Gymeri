from django.contrib import admin

from .models import HomeGym, Membership, Visit


@admin.register(HomeGym)
class HomeGymAdmin(admin.ModelAdmin):
    list_display = ["user", "gym"]
    search_fields = ["user__email"]
    list_select_related = ["user", "gym"]


class VisitInline(admin.TabularInline):
    model = Visit
    extra = 0


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ["owner", "name", "gym", "starts_on", "duration_days", "visits_limit"]
    list_filter = ["gym"]
    search_fields = ["owner__email", "name"]
    list_select_related = ["owner", "gym"]
    # The user list grows large; a search box beats a dropdown of everyone.
    autocomplete_fields = ["owner"]
    inlines = [VisitInline]
