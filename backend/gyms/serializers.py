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
    amenities = FilterOptionSerializer(many=True)


class GymListingSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    chain_slug = serializers.CharField()
    chain_name = serializers.CharField()
    street = serializers.CharField()
    address = serializers.CharField()
    highlight = serializers.CharField()
    area_m2 = serializers.IntegerField(allow_null=True)
    amenities = serializers.ListField(child=serializers.CharField())
    hours_summary = serializers.CharField()
    is_open_now = serializers.BooleanField()
    is_round_the_clock = serializers.BooleanField()
    price_from = serializers.DecimalField(max_digits=8, decimal_places=2, allow_null=True)
    photo_url = serializers.CharField(allow_null=True)


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
