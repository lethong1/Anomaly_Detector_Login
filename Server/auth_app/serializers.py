from .models import LoginLog, BlockIps
from rest_framework import serializers

class LoginLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginLog
        fields = '__all__'

class BlockIpsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockIps
        fields = '__all__'