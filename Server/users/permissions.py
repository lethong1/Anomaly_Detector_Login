from rest_framework import permissions

class UserPermission(permissions.BasePermission):
    """
    Custom permission để kiểm soát quyền truy cập user:
    - User thường: Có thể xem, thêm, sửa, xóa user thường (is_staff=False)
    - Admin/Staff: Có thể thao tác với tất cả user
    """
    
    def has_permission(self, request, view):
        # Chỉ user đã đăng nhập mới được truy cập
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Nếu user hiện tại là staff/admin -> có quyền với tất cả
        if request.user.is_staff:
            return True
        
        # Nếu user hiện tại không phải staff -> chỉ có quyền với user thường
        if not obj.is_staff:
            return True
        
        # User thường không được thao tác với staff/admin
        return False 