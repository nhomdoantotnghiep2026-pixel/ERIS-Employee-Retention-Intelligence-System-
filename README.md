# ERIS Backend

Backend dùng Node.js/Express và PostgreSQL. Phần auth đã làm xong các API; phần nhân sự có API đọc, dashboard và xuất CSV. AI mới có bộ khung.

## Chạy local

Yêu cầu Node.js 22 trở lên.

1. Tạo `backend/.env` từ `.env.example` nếu chưa có và điền kết nối database, JWT_SECRET.
2. Dùng database có schema do nhóm trưởng cung cấp. Backend không chạy migration hoặc tạo bảng. Auth dùng các bảng có sẵn: users, roles, audit_logs.
3. Chạy từ thư mục dự án:

```powershell
cd backend
npm.cmd ci
npm.cmd run start:local
```

Kiểm tra kết nối: `GET http://localhost:3000/health/ready` → `200`.
Role thực tế trên VPS: ADMIN, HR_MANAGER, HR_STAFF, DATA. Đặt `ROLE_ANALYST=DATA` trong `.env`.
Không commit `.env`; tài khoản đăng nhập ERIS khác tài khoản kết nối PostgreSQL.

## Test

Trong thư mục `backend`:

```powershell
npm.cmd test
```

Lần chạy mới nhất: 43/43 test pass. Test dùng PostgreSQL nhúng và giả lập gửi email, không kết nối VPS. Fixture chỉ có users, roles, audit_logs; không cần folder database.
Phiên bản dùng cookie mới chưa test trên VPS; lần test VPS trước thuộc bản lưu phiên bằng bảng SQL. Gửi email thật chưa test.

Auth hiện dùng access token 15 phút và refresh JWT 7 ngày trong cookie HttpOnly. Logout xóa cookie; token đã sao chép vẫn dùng được đến hạn. Không có thu hồi toàn bộ refresh token khi đổi/reset mật khẩu.

- [API auth và cách test](docs/authentication.md)
- [Request mẫu](backend/requests/auth.http)
- [API nghiệp vụ](docs/api.md)
- [Mapping feature AI](docs/feature-mapping.md)

## Phần còn lại

Chưa hoàn thiện CRUD nhân sự, tích hợp model/SHAP và giao diện. Forgot/reset password đã có API, cần cấu hình SMTP để gửi email. Thư mục `ai-service` mới là bộ khung.
