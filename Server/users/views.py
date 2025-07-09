from django.shortcuts import render
from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .serializers import UserSerializer
from .permissions import UserPermission
from auth_app.models import LoginLog
from auth_app.serializers import LoginLogSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate
from rest_framework import status
from django.contrib.auth.hashers import check_password
# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [UserPermission]

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk):
        try:
            target_user = User.objects.get(id=pk)
            old_password = request.data.get('password')
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')

            if not check_password(old_password, target_user.password):
                return Response({'detail': 'Mật khẩu cũ không đúng'}, status=status.HTTP_400_BAD_REQUEST)
            
            if new_password != confirm_password:
                return Response({'detail': 'Mật khẩu mới không khớp'}, status=status.HTTP_400_BAD_REQUEST)
            
            target_user.set_password(new_password)
            target_user.save() 
            return Response({'detail': 'Mật khẩu đã được đổi'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'User không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': f'Lỗi: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all().order_by('-date_joined')
        return User.objects.filter(is_staff=False).order_by('-date_joined')
    
    @action(detail=True, methods=['POST'], permission_classes=[IsAdminUser])
    def reset_password(self, request, pk):
        try:
            target_user = User.objects.get(id=pk)
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
        except User.DoesNotExist:
            return Response({'detail': 'User không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        if new_password != confirm_password:
            return Response({'detail': 'Mật khẩu mới không khớp'}, status=status.HTTP_400_BAD_REQUEST)
            
        target_user.set_password(new_password)
        target_user.save()
        
        return Response({'detail': 'Mật khẩu đã được đổi'}, status=status.HTTP_200_OK)
    
class UserLoginHistoryView(viewsets.ModelViewSet):
    permission_classes = [UserPermission]
    serializer_class = LoginLogSerializer
    def get_queryset(self):
        return LoginLog.objects.filter(username=self.request.user.username).order_by('-timestamp')