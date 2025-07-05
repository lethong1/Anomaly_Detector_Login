from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import LoginLog, BlockIps
from .serializers import LoginLogSerializer
from .detection import check_anomaly
from django.utils import timezone
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required

def get_client_ip(request):
    """Lấy IP thực của client, ưu tiên X-Forwarded-For header"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # X-Forwarded-For có thể chứa nhiều IP, lấy IP đầu tiên
        ip = x_forwarded_for.split(',')[0].strip()
        return ip
    return request.META.get('REMOTE_ADDR')

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    ip = get_client_ip(request)
    ua = request.META.get('HTTP_USER_AGENT')
    now = timezone.now()

    if BlockIps.objects.filter(ip_address=ip).exists():
        return Response({'status': 'blocked', 'message': 'IP is blocked'}, status=status.HTTP_403_FORBIDDEN)

    user = authenticate(username=username, password=password)
    success = user is not None
    anomaly_flag = check_anomaly(username, ip, now)

    # Xử lý các trường hợp anomaly
    if anomaly_flag == 'checkpoint':
        BlockIps.objects.create(ip_address=ip, blocked_reason='Too many failed attempts')
        resp_status = status.HTTP_403_FORBIDDEN
        resp = {'status': 'blocked', 'message': 'Too many failed attempts'}
    elif anomaly_flag == 'blocked':
        BlockIps.objects.create(ip_address=ip, blocked_reason='Too many failed attempts')
        resp_status = status.HTTP_403_FORBIDDEN
        resp = {'status': 'blocked', 'message': 'IP is blocked'}
    elif anomaly_flag == 'suspicious':
        resp_status = status.HTTP_403_FORBIDDEN
        resp = {'status': 'suspicious', 'message': 'Suspicious activity detected'}
    elif anomaly_flag == 'new_ip':
        resp_status = status.HTTP_200_OK
        resp = {'status': 'warning', 'message': 'New IP detected'}
    else:
        if success:
            resp_status = status.HTTP_200_OK
            resp = {'status': 'success', 'message': 'Login successful'}
        else:
            resp_status = status.HTTP_401_UNAUTHORIZED
            resp = {'status': 'failed', 'message': 'Invalid credentials'}

    # Ghi log
    LoginLog.objects.create(
        username=username,
        ip_address=ip,
        user_agent=ua,
        is_successful=success,
        anomaly_flag=anomaly_flag
    )
    return Response(resp, status=resp_status)

@api_view(['POST'])
def unblock_ip(request):
    """API để xóa IP khỏi danh sách block"""
    ip = request.data.get('ip')
    if not ip:
        return Response({'error': 'IP address is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        BlockIps.objects.filter(ip_address=ip).delete()
        return Response({'message': f'IP {ip} has been unblocked'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_login_logs(request):
    username = request.query_params.get('username')
    ip = request.query_params.get('ip')
    logs = LoginLog.objects.order_by('-timestamp')
    if username:
        logs = logs.filter(username=username)
    if ip:
        logs = logs.filter(ip_address=ip)
    paginator = PageNumberPagination()
    paginated_logs = paginator.paginate_queryset(logs, request)
    serializer = LoginLogSerializer(paginated_logs, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_api(request):
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = User.objects.filter(is_active=False).count()
    suspicious_logs = list(LoginLog.objects.exclude(anomaly_flag='normal').order_by('-timestamp')[:10].values('username','anomaly_flag','timestamp'))
    checkpoints = list(LoginLog.objects.filter(anomaly_flag='checkpoint').order_by('-timestamp')[:10].values('username','anomaly_flag','timestamp'))
    blocked_ips = list(BlockIps.objects.order_by('-id')[:10].values('ip_address','blocked_reason'))
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
        'suspicious_logs': suspicious_logs,
        'checkpoints': checkpoints,
        'blocked_ips': blocked_ips,
    })


