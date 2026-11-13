from rest_framework import serializers


class CatalogStatsSerializer(serializers.Serializer):
    gyms = serializers.IntegerField()
    chains = serializers.IntegerField()
    districts = serializers.IntegerField()


class ChainCardSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    short_name = serializers.CharField()
    description = serializers.CharField()
    logo_url = serializers.CharField(allow_null=True)
    locations_count = serializers.IntegerField()
    districts = serializers.ListField(child=serializers.CharField())
    price_from = serializers.DecimalField(max_digits=8, decimal_places=2, allow_null=True)
