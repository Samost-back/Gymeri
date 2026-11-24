from rest_framework import serializers


class CatalogStatsSerializer(serializers.Serializer):
    gyms = serializers.IntegerField()
    chains = serializers.IntegerField()
    streets = serializers.IntegerField()


class ChainCardSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    short_name = serializers.CharField()
    description = serializers.CharField()
    logo_url = serializers.CharField(allow_null=True)
    locations_count = serializers.IntegerField()
    streets = serializers.ListField(child=serializers.CharField())
    price_from = serializers.DecimalField(max_digits=8, decimal_places=2, allow_null=True)


class FilterOptionSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()


class FilterOptionsSerializer(serializers.Serializer):
    streets = FilterOptionSerializer(many=True)
    chains = FilterOptionSerializer(many=True)
    types = FilterOptionSerializer(many=True)
    audiences = FilterOptionSerializer(many=True)


class PromoSerializer(serializers.Serializer):
    plan_name = serializers.CharField(source="name")
    price = serializers.DecimalField(max_digits=8, decimal_places=2)
    ends_on = serializers.DateField(source="promo_ends_on", allow_null=True)


class GymListingSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    chain_slug = serializers.CharField()
    chain_name = serializers.CharField()
    street = serializers.CharField(source="street.name")
    address = serializers.CharField()
    highlight = serializers.CharField()
    area_m2 = serializers.IntegerField(allow_null=True)
    # Objects, not names: the client highlights the types a user filtered by, by slug.
    types = FilterOptionSerializer(many=True)
    audiences = FilterOptionSerializer(many=True)
    promo = PromoSerializer(allow_null=True)
    hours_summary = serializers.CharField()
    is_open_now = serializers.BooleanField()
    price_from = serializers.DecimalField(max_digits=8, decimal_places=2, allow_null=True)
    photo_url = serializers.CharField(allow_null=True)
    is_full_match = serializers.BooleanField()


class DayHoursSerializer(serializers.Serializer):
    name = serializers.CharField()
    hours = serializers.CharField(allow_null=True)
    is_today = serializers.BooleanField()


class PlanOfferSerializer(serializers.Serializer):
    name = serializers.CharField()
    duration_days = serializers.IntegerField()
    visits_limit = serializers.IntegerField(allow_null=True)
    audiences = FilterOptionSerializer(many=True)
    access_hours = serializers.CharField(allow_blank=True)
    price = serializers.DecimalField(max_digits=8, decimal_places=2)
    is_promo = serializers.BooleanField()
    promo_ends_on = serializers.DateField(allow_null=True)


class PhotoSerializer(serializers.Serializer):
    url = serializers.CharField()
    alt = serializers.CharField()


class GymProfileSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    chain_slug = serializers.CharField()
    chain_name = serializers.CharField()
    website = serializers.CharField()
    instagram_url = serializers.CharField()
    address = serializers.CharField()
    highlight = serializers.CharField()
    area_m2 = serializers.IntegerField(allow_null=True)
    phone = serializers.CharField()
    types = FilterOptionSerializer(many=True)
    latitude = serializers.FloatField(source="location.latitude")
    longitude = serializers.FloatField(source="location.longitude")
    photos = PhotoSerializer(many=True)
    hours_summary = serializers.CharField()
    is_open_now = serializers.BooleanField()
    week = DayHoursSerializer(many=True)
    plans = PlanOfferSerializer(many=True)


class MapPointSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    chain_name = serializers.CharField()
    website = serializers.CharField()
    instagram_url = serializers.CharField()
    address = serializers.CharField()
    # Plain numbers, not decimal strings: map libraries take floats.
    latitude = serializers.FloatField(source="location.latitude")
    longitude = serializers.FloatField(source="location.longitude")
