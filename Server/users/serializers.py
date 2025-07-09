from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'is_staff', 'date_joined', 'last_login', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'date_joined': {'read_only': True},
            'last_login': {'read_only': True}
        }

    def validate(self, data):
        # User thường không được set is_staff=True
        request = self.context.get('request')
        if request and not request.user.is_staff:
            if data.get('is_staff', False):
                raise serializers.ValidationError("Bạn không có quyền tạo user với quyền staff.")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user 
    