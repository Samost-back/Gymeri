from rest_framework import serializers

# The same shape as the public gym page, so the frontend reads one gym type everywhere.
from gyms.serializers import GymProfileSerializer


class ChooseGymSerializer(serializers.Serializer):
    gym = serializers.SlugField(max_length=150)


class NewMembershipSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    price = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)
    # Caps keep the numbers inside the database columns; the domain checks the meaning.
    duration_days = serializers.IntegerField(min_value=1, max_value=3660)
    visits_limit = serializers.IntegerField(
        min_value=1, max_value=1000, allow_null=True, required=False, default=None
    )
    starts_on = serializers.DateField()


class MembershipCardSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    gym_slug = serializers.CharField()
    gym_name = serializers.CharField()
    name = serializers.CharField()
    price = serializers.DecimalField(max_digits=8, decimal_places=2)
    starts_on = serializers.DateField()
    ends_on = serializers.DateField()
    status = serializers.CharField()
    days_left = serializers.IntegerField()
    visits_limit = serializers.IntegerField(allow_null=True)
    visits_used = serializers.IntegerField(allow_null=True)
    visits_left = serializers.IntegerField(allow_null=True)
    visited_today = serializers.BooleanField()


class AccountSerializer(serializers.Serializer):
    gym = GymProfileSerializer(allow_null=True)
    memberships = MembershipCardSerializer(many=True)
