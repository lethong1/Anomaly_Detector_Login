from django.urls import path
from .views import login_view, get_login_logs

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logs/', get_login_logs, name='get_login_logs'),
]