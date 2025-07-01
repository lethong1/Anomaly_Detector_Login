from django.db import models

# Create your models here.
class LoginLog(models.Model):
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('suspicious', 'Suspicious'),
        ('checkpoint', 'Checkpoint'),
        ('blocked', 'Blocked'),
        ('new_ip', 'New Ip Detected'),
    ]
    username = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_successful = models.BooleanField(default=False)
    anomaly_flag = models.CharField(max_length=100, default='normal', choices=STATUS_CHOICES)

class BlockIps(models.Model):
    ip_address = models.GenericIPAddressField(unique=True)
    blocked_at = models.DateTimeField(auto_now_add=True)
    blocked_reason = models.TextField()
