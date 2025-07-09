from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

def hacker_frontend_login():
    print("🌐 HACKER FRONTEND LOGIN - Tự động đăng nhập vào frontend")
    print("=" * 60)
    
    # Thông tin đăng nhập từ brute force
    USERNAME = "admin"  # Thay bằng username thật
    PASSWORD = "admin"  # Thay bằng password thật
    
    driver = None
    try:
        # Khởi tạo browser
        driver = webdriver.Chrome()
        driver.get("http://localhost:5173/login")
        
        print("📱 Đang mở trang login...")
        
        # Đợi form load
        wait = WebDriverWait(driver, 10)
        username_field = wait.until(EC.presence_of_element_located((By.NAME, "username")))
        password_field = driver.find_element(By.NAME, "password")
        
        # Nhập thông tin
        print(f"👤 Nhập username: {USERNAME}")
        username_field.send_keys(USERNAME)
        
        print(f"🔑 Nhập password: {PASSWORD}")
        password_field.send_keys(PASSWORD)
        
        # Click login
        login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
        login_button.click()
        
        print("🔄 Đang đăng nhập...")
        
        # Đợi chuyển trang
        wait.until(EC.url_contains("/dashboard"))
        
        print("✅ ĐĂNG NHẬP THÀNH CÔNG!")
        print(f"🌐 URL hiện tại: {driver.current_url}")
        
        # Lưu cookies và localStorage
        cookies = driver.get_cookies()
        local_storage = driver.execute_script("return window.localStorage;")
        
        print("\n🍪 Cookies:")
        for cookie in cookies:
            print(f"  {cookie['name']}: {cookie['value']}")
        
        print("\n💾 LocalStorage:")
        for key, value in local_storage.items():
            print(f"  {key}: {value}")
        
        # Lưu session info
        session_info = {
            "cookies": cookies,
            "localStorage": local_storage,
            "url": driver.current_url,
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        with open('hacker_session.json', 'w', encoding='utf-8') as f:
            json.dump(session_info, f, indent=2, ensure_ascii=False)
        
        print("\n💾 Đã lưu session vào 'hacker_session.json'")
        print("🎯 HACKER ĐÃ THÀNH CÔNG TRUY CẬP FRONTEND!")
        
        # Giữ browser mở để xem
        input("Press Enter to close browser...")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    hacker_frontend_login() 