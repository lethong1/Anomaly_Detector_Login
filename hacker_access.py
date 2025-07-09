import requests
import json

# Token từ brute force attack
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Thay bằng token thật
REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Thay bằng refresh token thật

BASE_URL = "http://localhost:8000/api"

def get_headers():
    return {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

def test_access():
    print("🔓 HACKER ACCESS - Sử dụng token để truy cập API")
    print("=" * 50)
    
    # Test các API endpoints
    endpoints = [
        "/dashboard/",
        "/users/",
        "/suspicious-logs/",
        "/blocked-ips/"
    ]
    
    for endpoint in endpoints:
        try:
            url = f"{BASE_URL}{endpoint}"
            print(f"\n📡 Testing: {url}")
            
            response = requests.get(url, headers=get_headers(), timeout=5)
            
            if response.status_code == 200:
                print(f"✅ SUCCESS - Status: {response.status_code}")
                data = response.json()
                print(f"📊 Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 HACKER CÓ THỂ:")
    print("1. Truy cập tất cả API với token")
    print("2. Lấy dữ liệu users, logs, dashboard")
    print("3. Thực hiện các thao tác CRUD")
    print("4. Bypass frontend authentication hoàn toàn!")

if __name__ == "__main__":
    test_access() 