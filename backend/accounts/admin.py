from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import User


# Django's stock forms are bound to its own User and ask for a username.
class UserAddForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["email", "role"]


class UserEditForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    add_form = UserAddForm
    form = UserEditForm
    # Django's UserAdmin lists username and names, which this model doesn't have.
    list_display = ["email", "role", "is_staff", "is_active", "date_joined"]
    list_filter = ["role", "is_staff", "is_active"]
    search_fields = ["email"]
    ordering = ["email"]
    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Роль і доступ", {"fields": ["role", "is_active", "is_staff", "is_superuser"]}),
        ("Дати", {"fields": ["last_login", "date_joined"]}),
    ]
    add_fieldsets = [
        (None, {"classes": ["wide"], "fields": ["email", "password1", "password2", "role"]}),
    ]
