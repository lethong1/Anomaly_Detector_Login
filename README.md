# Anomaly Detector Login & Management System
Hệ thống quản lý đăng nhập và phát hiện các truy cập bất thường (Anomaly Detection) sử dụng công nghệ Machine Learning/Statistical Analysis để bảo vệ tài khoản người dùng.

## 1. Yêu cầu hệ thống
- Python: >= 3.9
- Node.js: >= 18 (Vite/React)
- Database: PostgreSQL (Khuyên dùng) hoặc SQLite
- Công cụ: Git, venv, npm/yarn

## 2. Cấu trúc dự án
- /Server: Backend Django REST Framework (Xử lý logic, API, phát hiện bất thường).

- /Layout: Frontend React (Vite) cung cấp giao diện quản trị và Dashboard.

- /Scripts: Các công cụ bổ trợ như brute_force_attack.py, hacker_access.py để test hệ thống.

## 3. Cài đặt Backend (Django)

### Bước 1: Khởi tạo môi trường
```bash
cd Server
python -m venv venv
```
** Windows
```bash venv\Scripts\activate ```
** Linux/Mac
```bash source venv/bin/activate```
### Bước 2: Cài đặt thư viện
```bash
pip install -r requirements.txt
```
### Bước 3: Cấu hình biến môi trường
Tạo file .env trong thư mục /Server/ (ngang hàng với manage.py) và cấu hình các thông số sau:
Code snippet
```bash
DEBUG=True
SECRET_KEY=your_secret_key_here
DB_NAME=anomaly_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```
### Bước 4: Khởi tạo Database
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser # Tạo tài khoản Admin
```
### Bước 5: Chạy Server
```bash
python manage.py runserver
```
## 4. Cài đặt Frontend (React + Vite)
### Bước 1: Cài đặt thư viện
```bash
cd Layout
npm install
```
### Bước 2: Cấu hình API
Đảm bảo file src/utils/axios.js hoặc cấu hình API trỏ về http://localhost:8000/api/.
### Bước 3: Chạy Development
```bash
npm run dev
```
Mặc định truy cập tại: http://localhost:5173

## 5. Các tính năng chính
Phát hiện bất thường (Anomaly Detection): Tự động phân tích IP, vị trí, thời gian và thiết bị để cảnh báo các lần đăng nhập lạ.
Quản lý người dùng: Admin có quyền tạo, sửa, xóa và theo dõi nhật ký hoạt động của User.
Bảo mật hệ thống:
- Chặn IP khi có dấu hiệu Brute Force.
- Cấp quyền truy cập dựa trên Role (Admin/User).
- JWT Authentication.
Dashboard báo cáo: Biểu đồ thống kê các lượt truy cập hợp lệ và các vụ tấn công bị chặn.

## 6. Công cụ kiểm thử (Test Scripts)
Hệ thống đi kèm các script để mô phỏng các cuộc tấn công nhằm kiểm tra độ nhạy của bộ phát hiện:
- brute_force_attack.py: Mô phỏng tấn công dò mật khẩu.
- ip_fake_test_attack.py: Kiểm tra khả năng phát hiện IP giả mạo.
- clear_blocked_ips.py: Script hỗ trợ admin giải phóng nhanh các IP bị chặn trong quá trình test.

## 7. API Endpoints chính
- Auth: /api/auth/login/, /api/auth/logout/
- Users: /api/users/ (Quản lý danh sách người dùng)
- Logs: /api/auth-app/logs/ (Xem nhật ký đăng nhập và cảnh báo bất thường)
- Settings: /api/settings/ (Cấu hình ngưỡng nhạy cảm cho thuật toán phát hiện)

## 8. Xử lý lỗi thường gặp
- Lỗi CORS: Đảm bảo đã thêm localhost:5173 vào CORS_ALLOWED_ORIGINS trong settings.py.
- Lỗi Driver: Nếu chạy các script test liên quan đến Selenium, hãy đảm bảo đã chạy download_chromedriver.py để có driver phù hợp.
- Trắng trang Dashboard: Kiểm tra xem Token JWT đã hết hạn chưa, thực hiện đăng nhập lại.

## 9. Liên hệ phát triển
Nếu có bất kỳ thắc mắc hoặc đóng góp nào cho dự án, vui lòng liên hệ:
Email: lehuuthong2004@gmail.com
