from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import LoginLog, BlockIps
from .serializers import LoginLogSerializer, BlockIpsSerializer
from .detection import check_anomaly
from django.utils import timezone
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate
from users.serializers import UserSerializer
def get_client_ip(request):
    """Lấy IP thực của client, ưu tiên X-Forwarded-For header"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # X-Forwarded-For có thể chứa nhiều IP, lấy IP đầu tiên
        ip = x_forwarded_for.split(',')[0].strip()
        return ip
    return request.META.get('REMOTE_ADDR')

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    ip = get_client_ip(request)
    ua = request.META.get('HTTP_USER_AGENT')
    now = timezone.now()

    # Kiểm tra IP đã bị block chưa
    if BlockIps.objects.filter(ip_address=ip).exists():
        return Response({'status': 'blocked', 'message': 'IP is blocked'}, status=status.HTTP_403_FORBIDDEN)

    # Kiểm tra tên đăng nhập và mật khẩu
    user = authenticate(username=username, password=password)
    success = user is not None
    anomaly_flag = check_anomaly(username, ip, now)

    #Ghi log
    LoginLog.objects.create(
        username=username,
        ip_address=ip,
        user_agent=ua,
        is_successful=success,
        anomaly_flag=anomaly_flag
    )
    # Xử lý các trường hợp anomaly
    if anomaly_flag == 'blocked':
        BlockIps.objects.create(ip_address=ip, blocked_reason='Too many failed attempts')
        resp_status = status.HTTP_403_FORBIDDEN
        resp = {'status': 'blocked', 'message': 'IP is blocked'}
        return Response(resp, status=resp_status)
    elif anomaly_flag == 'suspicious':
        resp_status = status.HTTP_403_FORBIDDEN
        resp = {'status': 'suspicious', 'message': 'Suspicious activity detected'}
        return Response(resp, status=resp_status)
    elif anomaly_flag == 'new_ip':
        resp_status = status.HTTP_200_OK
        resp = {'status': 'warning', 'message': 'New IP detected'}
        return Response(resp, status=resp_status)
    else:
        if success:
            refresh = TokenObtainPairSerializer.get_token(user)
            resp_status = status.HTTP_200_OK
            resp = {
                'status': 'success', 
                'message': 'Login successful', 
                'access': str(refresh.access_token), 
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'ip_address': ip
            }
            return Response(resp, status=resp_status)
        else:
            resp_status = status.HTTP_401_UNAUTHORIZED
            resp = {'status': 'failed', 'message': 'Invalid credentials'}
            return Response(resp, status=resp_status)

@api_view(['POST'])
def unblock_ip(request):
    """API để xóa IP khỏi danh sách block"""
    ip = request.data.get('ip_address')
    if not ip:
        return Response({'error': 'IP address is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        BlockIps.objects.filter(ip_address=ip).delete()
        return Response({'message': f'IP {ip} has been unblocked'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_login_logs(request):
    username = request.query_params.get('username')
    ip = request.query_params.get('ip')
    anomaly_type = request.query_params.get('anomaly_type')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    logs = LoginLog.objects.order_by('-timestamp')
    ordering = request.query_params.get('ordering')
    if ordering:
        logs = logs.order_by(ordering)
    # Áp dụng filters
    if username:
        logs = logs.filter(username__icontains=username)
    if ip:
        logs = logs.filter(ip_address__icontains=ip)
    if anomaly_type:
        logs = logs.filter(anomaly_flag=anomaly_type)
    if date_from and date_to:
        logs = logs.filter(timestamp__date__range=[date_from, date_to])
    
    # Thống kê (tính trên toàn bộ dữ liệu, không bị ảnh hưởng bởi pagination)
    total_logs = LoginLog.objects.count()
    blocked_attempts = LoginLog.objects.filter(anomaly_flag='blocked').count()
    suspicious_attempts = LoginLog.objects.filter(anomaly_flag='suspicious').count()
    today_logs = LoginLog.objects.filter(timestamp__date=timezone.now().date()).count()
    
    # Áp dụng pagination
    paginator = PageNumberPagination()
    paginator.page_size_query_param = 'page_size'
    paginator.page_size = 20  # Số items mỗi trang
    paginated_logs = paginator.paginate_queryset(logs, request)
    
    # Chuyển đổi dữ liệu để phù hợp với frontend
    logs_data = []
    for log in paginated_logs:
        logs_data.append({
            'id': log.id,
            'timestamp': log.timestamp,
            'ip_address': log.ip_address,
            'username': log.username,
            'anomaly_type': log.anomaly_flag,
            'description': f"{'Thành công' if log.is_successful else 'Thất bại'} - {log.anomaly_flag}",
            'user_agent': log.user_agent,
            'is_successful': log.is_successful
        })
    
    # Lấy thông tin pagination
    pagination_info = {
        'count': paginator.page.paginator.count,
        'next': paginator.get_next_link(),
        'previous': paginator.get_previous_link(),
        'results': logs_data
    }
    
    return Response({
        'logs': logs_data,
        'pagination': pagination_info,
        'stats': {
            'total_logs': total_logs,
            'blocked_attempts': blocked_attempts,
            'suspicious_attempts': suspicious_attempts,
            'today_logs': today_logs
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_api(request):
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = User.objects.filter(is_active=False).count()
    suspicious_logs = list(LoginLog.objects.exclude(anomaly_flag='normal').order_by('-timestamp')[:10].values('username','anomaly_flag','timestamp'))
    blocked_ips = list(BlockIps.objects.order_by('-id')[:10].values('ip_address','blocked_reason'))
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
        'suspicious_logs': suspicious_logs,
        'blocked_ips': blocked_ips,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def login_chart_data(request):
    seven_days_ago = timezone.now() - timedelta(days=7)
    today = timezone.now().date()

    chart_data = LoginLog.objects.filter(
        timestamp__gte=seven_days_ago).annotate(date=TruncDate('timestamp')).values('date') \
        .annotate(logins=Count('id')).order_by('date')

    formatted_data = [  
        {
            'date': item['date'],
            'logins': item['logins']
        }
        for item in chart_data
    ]

    # Thống kê trong ngày hôm nay
    today_success = LoginLog.objects.filter(timestamp__date=today, is_successful=True).count()
    today_failed = LoginLog.objects.filter(timestamp__date=today, is_successful=False).count()
    today_blocked = LoginLog.objects.filter(timestamp__date=today, anomaly_flag__in= 'blocked').count() \
    + BlockIps.objects.filter(blocked_at__date=today).count()
    
    return Response({
        'chart_data': formatted_data,
        'today_failed': today_failed,
        'today_blocked': today_blocked,
        'today_success': today_success
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_blacklist(request):
    blacklist_type = request.data.get('type')
    reason = request.data.get('blocked_reason')
    
    if not blacklist_type:
        return Response({'error': 'Type is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not reason:
        return Response({'error': 'Reason is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if blacklist_type == 'ip':
        ip = request.data.get('ip_address')
        if not ip:
            return Response({'error': 'IP address is required'}, status=status.HTTP_400_BAD_REQUEST)
        BlockIps.objects.create(ip_address=ip, blocked_reason=reason)
        return Response({'message': f'IP {ip} has been added to blacklist'}, status=status.HTTP_200_OK)
    
    elif blacklist_type == 'user':
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Kiểm tra user có tồn tại không
        try:
            user = User.objects.get(username=username)
            # Block user bằng cách set is_active = False
            user.is_active = False
            user.save()
            return Response({'message': f'User {username} has been blocked'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': f'User {username} does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    else:
        return Response({'error': 'Invalid type. Must be "ip" or "user"'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_blocked_ips(request):
    blocked_ips = BlockIps.objects.all()
    serializer = BlockIpsSerializer(blocked_ips, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


