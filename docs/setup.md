# Hướng dẫn chạy

## 1. Backend local

Yêu cầu Node.js >=22 và một database PostgreSQL có schema tương ứng. Máy hiện tại đã có Node.js 24. File SQL chỉ cung cấp cấu trúc, không chứa địa chỉ VPS, mật khẩu hoặc dữ liệu role.

```powershell
cd backend
Copy-Item .env.example .env
npm.cmd ci
```

Điền vào `.env`: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, JWT_SECRET. Lấy host/port đúng từ Properties → Connection của kết nối **TalentGuard VPS** trong pgAdmin; database là `talentguard`. Không dùng lại cổng 5433 local chỉ vì lệnh export cũ đã dùng nó. Không gửi mật khẩu qua chat hoặc commit `.env`.

JWT_SECRET phải là chuỗi ngẫu nhiên ít nhất 32 ký tự. Có thể tạo bằng:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Tên role mặc định là SYSTEM_ADMIN, HR_STAFF, HR_MANAGER, DATA_AI_ANALYST. Schema không có dữ liệu nên chưa xác định được tên role thực tế. Xem bằng truy vấn chỉ đọc trong Query Tool của database talentguard:

```sql
SELECT id, name FROM public.roles ORDER BY id;
```

Gán tên chính xác tương ứng vào ROLE_ADMIN, ROLE_HR_STAFF, ROLE_HR_MANAGER, ROLE_ANALYST. Role khác không được truy cập các module. Không ánh xạ nhiều vai trò về cùng một tên. Bản scaffold dùng quyền trong mã nguồn, chưa có bảng permissions hoặc API sửa permission.

Login hiện hỗ trợ **bcrypt** trong `users.password_hash`, email được so khớp chính xác sau khi trim. Nếu dự án cũ dùng thuật toán khác, cần sửa adapter auth; không reset mật khẩu hiện có. Không có tài khoản mặc định và không tự seed user.

Quyền database cần cho scaffold: CONNECT database, USAGE schema public, SELECT trên 12 bảng. Sử dụng account do nhóm quản lý, tránh tài khoản owner nếu chỉ chạy các API đọc. TLS: PGSSLMODE=require khi endpoint hỗ trợ TLS, PGSSLROOTCERT nếu cần CA riêng. Không tắt xác minh chứng chỉ.

```powershell
npm.cmd test
npm.cmd run start:local
```

Health: `http://localhost:3000/health/live` và `/health/ready`. Liveness chỉ báo process chạy; readiness kiểm tra `SELECT 1`, chưa xác minh đủ schema/quyền. API chi tiết nằm ở [api.md](api.md).

## 2. Docker

Từ thư mục gốc sau khi điền backend/.env:

```powershell
docker compose up --build backend
```

Nếu PostgreSQL chạy trên máy Windows host, PGHOST trong container thường dùng `host.docker.internal`; `localhost` trong container trỏ vào chính container. Nếu kết nối VPS, dùng hostname của VPS.

AI là profile tùy chọn, chưa kết nối với Node API:

```powershell
Copy-Item ai-service/.env.example ai-service/.env
# Điền token ngẫu nhiên tối thiểu 32 ký tự rồi chạy:
docker compose --profile ai up --build
```

AI chỉ expose port nội bộ Docker. Service chưa có model nên readiness trả 503 là chủ đích. Chưa có SHAP/sklearn dependencies hoặc artifact: chỉ thêm sau khi chọn pipeline và chốt phiên bản thư viện dùng train.

## 3. Database và triển khai

Repo không chạy migration, restore hoặc seed lúc startup. Không restore schema tham chiếu đè lên database VPS đang có. Nếu tạo database development, DBA cần xử lý owner `talentguard` và các lệnh đặc thù pg_dump trước khi restore bằng psql phù hợp.

Trước khi triển khai công khai: kiểm thử TLS, quyền SQL và role thực tế; cấu hình proxy tin cậy theo hạ tầng nếu đứng sau reverse proxy; rate limiter hiện lưu trong RAM và phù hợp một instance. Session hết hạn sau 15 phút, chưa có refresh/revoke token theo phiên. Deactivate tài khoản và đổi role được đọc lại mỗi request.
