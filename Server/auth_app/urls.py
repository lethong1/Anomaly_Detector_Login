from django.urls import path
from .views import login_view, get_login_logs, dashboard_api, unblock_ip, login_chart_data, add_to_blacklist, get_blocked_ips

urlpatterns = [
    path('login/', login_view, name='login'),
    path('unblock/', unblock_ip, name='unblock_ip'),
    path('logs/', get_login_logs, name='get_login_logs'),
    path('dashboard-api/', dashboard_api, name='dashboard_api'),
    path('login-chart-data/', login_chart_data, name='login_chart_data'),
    path('add-to-blacklist/', add_to_blacklist, name='add_to_blacklist'),
    path('get-blocked-ips/', get_blocked_ips, name='get_blocked_ips'),
]