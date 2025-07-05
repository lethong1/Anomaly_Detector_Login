from django.contrib import admin
from .models import LoginLog, BlockIps
# Register your models here.
@admin.register(LoginLog)
class LoginLogAdmin(admin.ModelAdmin):
    list_display = ('username', 'ip_address', 'timestamp', 'is_successful', 'anomaly_flag')
    search_fields = ('username', 'ip_address')
    list_per_page = 50
    list_filter = ('is_successful', 'anomaly_flag')
    ordering = ('-timestamp',)
@admin.register(BlockIps)
class BlockIpsAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'blocked_reason')
    search_fields = ('ip_address', 'blocked_reason')
    list_per_page = 50
    ordering = ('-blocked_at',)