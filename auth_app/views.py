from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import LoginLog, BlockIps
from .serializers import LoginLogSerializer
from .detection import check_anomaly
from django.utils import timezone
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
# Create your views here.

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    ip = request.META.get('HTTP_X_FORWARDED_FOR',request.META.get('REMOTE_ADDR'))
    ua = request.META.get('HTTP_USER_AGENT')
    now = timezone.now()
   
    if BlockIps.objects.filter(ip_address=ip).exists():
        return Response({'error': 'IP is blocked'}, status=status.HTTP_403_FORBIDDEN)
    
    user = authenticate(username=username, password=password)
    success = user is not None
    anomaly_flag = check_anomaly(username, ip, now)
    
    
    if anomaly_flag == 'checkpoint':
        BlockIps.objects.create(ip_address=ip, blocked_reason='Too many failed attempts')
        status_code = status.HTTP_403_FORBIDDEN
        response = {'error': 'Too many failed attempts'}
    elif anomaly_flag == 'blocked':
        BlockIps.objects.create(ip_address=ip, blocked_reason='Too many failed attempts')
        status_code = status.HTTP_403_FORBIDDEN
        response = {'error': 'IP is blocked'}
    elif anomaly_flag == 'suspicious':
        status_code = status.HTTP_403_FORBIDDEN
        response = {'error': 'Suspicious activity detected'}
    elif anomaly_flag == 'new_ip':
        status_code = status.HTTP_200_OK
        response = {'warning': 'New IP detected'}
    else:
        status_code = status.HTTP_200_OK
        response = {
            'status': 'success' if success else 'failed',
            'anomaly_flag': anomaly_flag
        }
    #Ghi lại log
    LoginLog.objects.create(
        username=username,
        ip_address=ip,
        user_agent=ua,
        is_successful=success,
        anomaly_flag=anomaly_flag
    )
    return Response(response, status=status_code)

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
