from datetime import timedelta
from django.utils import timezone
from .models import LoginLog

def check_anomaly(username, ip, now):
    # Kiểm tra số lần đăng nhập thất bại
    recent_fails = LoginLog.objects.filter(
        username=username,
        ip_address=ip,
        timestamp__gte=now - timedelta(minutes=5),
        is_successful=False,
    )
    
    if recent_fails.count() >= 5:
        return 'blocked'
    elif recent_fails.count() >= 3:
        return 'suspicious'
    
    known_ips = LoginLog.objects.filter(username=username).values_list('ip_address', flat=True).distinct()
    if ip not in known_ips and known_ips.exists():
        return 'new_ip'
    return 'normal'

