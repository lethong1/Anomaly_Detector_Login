#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'anomaly_detector_login.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password

def test_password():
    """Test password hash và tạo user mới"""
    
    # Test hash của password "admin"
    test_password = "admin"
    hashed = make_password(test_password)
    print(f"Password: '{test_password}'")
    print(f"Hash: {hashed}")
    print(f"Check result: {check_password(test_password, hashed)}")
    
    # So sánh với hash hiện tại
    current_hash = "pbkdf2_sha256$1000000$zoEip1Gc33ppJb7tytjizV$oS6YBaIAYffWTLdu0tF2+ndkllwAqTv8Gs4jH9xAvGM="
    print(f"\nCurrent hash: {current_hash}")
    print(f"Check 'admin' against current hash: {check_password('admin', current_hash)}")
    
    # Thử một số password phổ biến
    common_passwords = ['admin', 'password', '123456', 'admin123', 'root', 'user', 'test']
    print("\nTesting common passwords:")
    for pwd in common_passwords:
        result = check_password(pwd, current_hash)
        print(f"'{pwd}': {result}")
    
    # Tạo user mới với password "admin" để test
    try:
        new_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='admin'
        )
        print(f"\nCreated test user: {new_user.username}")
        print(f"Test user password hash: {new_user.password}")
        print(f"Check 'admin' against test user: {check_password('admin', new_user.password)}")
    except Exception as e:
        print(f"Error creating test user: {e}")

if __name__ == '__main__':
    test_password() 