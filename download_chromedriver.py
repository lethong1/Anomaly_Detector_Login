import requests
import zipfile
import os
import shutil

def download_chromedriver():
    url = "https://storage.googleapis.com/chrome-for-testing-public/140.0.7259.2/win64/chromedriver-win64.zip"
    zip_file = "chromedriver-win64.zip"
    
    print("📥 Đang tải ChromeDriver...")
    
    # Tải file
    response = requests.get(url)
    with open(zip_file, 'wb') as f:
        f.write(response.content)
    
    print("📦 Đang giải nén...")
    
    # Giải nén
    with zipfile.ZipFile(zip_file, 'r') as zip_ref:
        zip_ref.extractall(".")
    
    # Di chuyển chromedriver.exe vào thư mục hiện tại
    chromedriver_path = "chromedriver-win64/chromedriver.exe"
    if os.path.exists(chromedriver_path):
        shutil.move(chromedriver_path, "chromedriver.exe")
        print("✅ ChromeDriver đã được tải và cài đặt thành công!")
        print("📍 Đường dẫn: chromedriver.exe")
    else:
        print("❌ Không tìm thấy chromedriver.exe trong file zip")
    
    # Dọn dẹp
    if os.path.exists(zip_file):
        os.remove(zip_file)
    if os.path.exists("chromedriver-win64"):
        shutil.rmtree("chromedriver-win64")

if __name__ == "__main__":
    download_chromedriver() 