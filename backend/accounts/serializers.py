from rest_framework import serializers

from .models import User


class CredentialsSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    # Spaces count as part of the password. The cap keeps a huge body from tying up the
    # server hashing it.
    password = serializers.CharField(max_length=128, trim_whitespace=False)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "role"]
