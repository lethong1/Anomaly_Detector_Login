import requests
import random
import time

URL = "http://localhost:8000/api/login/"
USERNAME = "user1"
PASSWORD = "wrong123"

# Danh sách IP để test - sử dụng range khác nhau
IP_RANGES = [
    "10.0.0",    # Private network
    "172.16.0",  # Private network  
    "192.168.0", # Private network
    "203.0.113", # Test network
    "198.51.100" # Test network
]

def test_with_fake_ip():
    """Test với IP giả mạo"""
    print("=== Bắt đầu test với IP giả mạo ===")
    
    for range_prefix in IP_RANGES:
        print(f"\n--- Testing với range {range_prefix}.x ---")
        
        for i in range(1, 6):  # Test 5 IP trong mỗi range
            fake_ip = f"{range_prefix}.{i}"
            
            headers = {
                "X-Forwarded-For": fake_ip,
                "User-Agent": f"TestBot/{i}"
            }
            
            try:
                res = requests.post(URL, data={
                    'username': USERNAME,
                    'password': PASSWORD
                }, headers=headers, timeout=5)
                
                # Parse response
                try:
                    response_data = res.json()
                    status_msg = response_data.get('status', 'unknown')
                    message = response_data.get('message', '')
                except:
                    response_data = res.text
                    status_msg = 'unknown'
                    message = response_data
                
                print(f"[{fake_ip}] Status: {res.status_code} | {status_msg} | {message}")
                
                # Nếu IP bị block, dừng test range này
                if status_msg == 'blocked':
                    print(f"  ⚠️  IP {fake_ip} đã bị block, chuyển sang range khác")
                    break
                    
            except requests.exceptions.RequestException as e:
                print(f"[{fake_ip}] Lỗi kết nối: {e}")
            
            # Delay nhỏ giữa các request
            time.sleep(0.1)
    
    print("\n=== Hoàn thành test ===")

def test_single_ip(ip):
    """Test với 1 IP cụ thể"""
    print(f"\n=== Test với IP: {ip} ===")
    
    headers = {
        "X-Forwarded-For": ip,
        "User-Agent": "SingleTestBot"
    }
    
    try:
        res = requests.post(URL, data={
            'username': USERNAME,
            'password': PASSWORD
        }, headers=headers, timeout=5)
        
        try:
            response_data = res.json()
            status_msg = response_data.get('status', 'unknown')
            message = response_data.get('message', '')
        except:
            response_data = res.text
            status_msg = 'unknown'
            message = response_data
        
        print(f"Status: {res.status_code} | {status_msg} | {message}")
        return status_msg
        
    except requests.exceptions.RequestException as e:
        print(f"Lỗi kết nối: {e}")
        return 'error'

if __name__ == "__main__":
    # Test với nhiều IP khác nhau
    test_with_fake_ip()
    
    # Test với 1 IP cụ thể
    # test_single_ip("192.168.1.100")
