from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserLoginHistoryView
from django.urls import path, include

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'user-login-history', UserLoginHistoryView, basename='user-login-history')

urlpatterns = [
    path('', include(router.urls)),
    path('users/<int:pk>/', UserViewSet.as_view({'delete': 'destroy', 'patch': 'update'}), name='user-detail'),
    path('users/<int:pk>/change-password/', UserViewSet.as_view({'post': 'change_password'}), name='change-password'),
    path('users/<int:pk>/reset-password/', UserViewSet.as_view({'post': 'reset_password'}), name='reset-password'),
]