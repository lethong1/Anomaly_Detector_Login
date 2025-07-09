#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'anomaly_detector_login.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password, is_password_usable

def test_password_hashing():
    """Test password hashing độc lập"""
    
    # Test 1: Tạo hash mới
    test_password = "admin"
    print(f"Testing password: '{test_password}'")
    
    # Tạo hash
    hashed = make_password(test_password)
    print(f"Generated hash: {hashed}")
    print(f"Hash starts with '!': {hashed.startswith('!')}")
    print(f"Hash starts with 'pbkdf2': {hashed.startswith('pbkdf2')}")
    
    # Kiểm tra hash
    is_valid = check_password(test_password, hashed)
    print(f"Check password result: {is_valid}")
    print(f"Is password usable: {is_password_usable(hashed)}")
    
    # Test 2: Tạo user mới
    print("\n--- Creating new user ---")
    try:
        new_user = User.objects.create_user(
            username='test_hash_user',
            email='test@hash.com',
            password=test_password
        )
        print(f"User created: {new_user.username}")
        print(f"User password hash: {new_user.password}")
        print(f"User hash starts with '!': {new_user.password.startswith('!')}")
        print(f"User hash starts with 'pbkdf2': {new_user.password.startswith('pbkdf2')}")
        print(f"Check user password: {check_password(test_password, new_user.password)}")
        
        # Xóa user
        new_user.delete()
        print("Test user deleted")
    except Exception as e:
        print(f"Error creating user: {e}")
    
    # Test 3: Kiểm tra user hiện tại
    print("\n--- Checking existing users ---")
    users = User.objects.all()
    for user in users:
        print(f"User: {user.username}")
        print(f"  Password hash: {user.password}")
        print(f"  Hash starts with '!': {user.password.startswith('!')}")
        print(f"  Hash starts with 'pbkdf2': {user.password.startswith('pbkdf2')}")
        print(f"  Is password usable: {is_password_usable(user.password)}")
        if user.password.startswith('pbkdf2'):
            print(f"  Check 'admin': {check_password('admin', user.password)}")
            print(f"  Check 'admin123': {check_password('admin123', user.password)}")

if __name__ == '__main__':
    test_password_hashing() 