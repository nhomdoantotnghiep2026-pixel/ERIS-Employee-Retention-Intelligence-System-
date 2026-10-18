# ERIS Backend

Backend dùng Node.js/Express và PostgreSQL. Có auth, quản lý hồ sơ nhân viên, danh mục phòng ban/vị trí, dashboard và xuất CSV. AI mới có bộ khung.

## Chạy local

Yêu cầu Node.js 22 trở lên.

1. Tạo `backend/.env` từ `.env.example` nếu chưa có và điền kết nối database, JWT_SECRET.
2. Dùng database có schema do nhóm trưởng cung cấp. Backend không chạy migration hoặc tạo bảng. Auth dùng users, role, employees và audit_logs.
3. Chạy từ thư mục dự án:

```powershell
cd backend
npm.cmd ci
npm.cmd run start:local
```

Kiểm tra kết nối: `GET http://localhost:3000/health/ready` → `200`.
Role thực tế trên VPS: ADMIN, HR, EMPLOYEE. Đặt `ROLE_HR=HR` trong `.env`. Chỉ HR quản lý Department/Position; UM-03 đã bỏ theo yêu cầu nhóm trưởng.
Không commit `.env`; tài khoản đăng nhập ERIS khác tài khoản kết nối PostgreSQL.

## Test

Trong thư mục `backend`:

```powershell
npm.cmd test
```

Test dùng PostgreSQL nhúng với snapshot schema nhóm trưởng và giả lập gửi email. Kiểm tra schema thật bằng `node --env-file=.env scripts/check-database-schema.js` trong thư mục backend; lệnh này chỉ đọc database.

Auth hiện dùng access token tối đa 1 giờ và refresh JWT 7 ngày trong cookie HttpOnly. Logout xóa cookie; token đã sao chép vẫn dùng được đến hạn. Không có thu hồi toàn bộ refresh token khi đổi/reset mật khẩu.

- [API auth và cách test](docs/authentication.md)
- [Request mẫu](backend/requests/auth.http)
- [API nghiệp vụ](docs/api.md)
- [Các thay đổi theo database mới](backend/docs/database-schema-update.md)
- [Employee Management và tính khoảng cách tự động](backend/docs/employee-management.md)
- [Mapping feature AI](docs/feature-mapping.md)

## Phần còn lại

Employee Management có tạo, đọc và cập nhật hồ sơ theo thiết kế; không có API xóa trong phạm vi được giao. Chưa tích hợp model/SHAP và giao diện Employee Management. Forgot/reset password cần cấu hình SMTP để gửi email. Thư mục `ai-service` mới là bộ khung.
