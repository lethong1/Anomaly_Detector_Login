import requests
import json

# URL để xóa IP bị block
UNBLOCK_URL = "http://127.0.0.1:8000/api/unblock/"

def clear_all_blocked_ips():
    """Xóa tất cả IP bị block"""
    try:
        # Lấy danh sách IP bị block từ dashboard API
        dashboard_response = requests.get("http://127.0.0.1:8000/api/dashboard-api/")
        if dashboard_response.status_code == 200:
            data = dashboard_response.json()
            blocked_ips = data.get('blocked_ips', [])
            
            print(f"Tìm thấy {len(blocked_ips)} IP bị block:")
            for ip_info in blocked_ips:
                ip = ip_info.get('ip_address')
                reason = ip_info.get('blocked_reason')
                print(f"  - {ip}: {reason}")
                
                # Xóa IP này
                unblock_response = requests.post(UNBLOCK_URL, data={'ip': ip})
                if unblock_response.status_code == 200:
                    print(f"    ✓ Đã xóa IP {ip}")
                else:
                    print(f"    ✗ Lỗi khi xóa IP {ip}: {unblock_response.text}")
        else:
            print(f"Không thể lấy danh sách IP bị block: {dashboard_response.status_code}")
            
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    print("Đang xóa tất cả IP bị block...")
    clear_all_blocked_ips()
    print("Hoàn thành!") 