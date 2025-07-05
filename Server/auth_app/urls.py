from django.urls import path
from .views import login_view, get_login_logs, dashboard_api, unblock_ip

urlpatterns = [
    path('login/', login_view, name='login'),
    path('unblock/', unblock_ip, name='unblock_ip'),
    path('logs/', get_login_logs, name='get_login_logs'),
    path('dashboard-api/', dashboard_api, name='dashboard_api'),
]