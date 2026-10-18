# Authentication

Auth dùng refresh token trong cookie và OTP mật khẩu trong Redis. Database không có bảng session/reset token. Schema đã đối chiếu ngày 18/10/2026; xem [chi tiết thay đổi](../backend/docs/database-schema-update.md).

## API

| Method | Endpoint | Đầu vào | Kết quả |
|---|---|---|---|
| POST | /api/auth/login | email, password | accessToken, user; cookie refresh |
| GET | /api/auth/me | Bearer accessToken | id, email, fullName, employeeId, roleId, status |
| POST | /api/auth/refresh | Cookie eris_refresh | accessToken mới |
| POST | /api/auth/logout | Không cần body | Xóa cookie ở trình duyệt hiện tại |
| POST | /api/auth/change-password/otp | Bearer accessToken | Gửi OTP đổi mật khẩu |
| PATCH | /api/auth/change-password | Bearer; currentPassword, otp, newPassword | Đổi mật khẩu |
| POST | /api/auth/forgot-password | email | Thông báo chung, gửi OTP nếu account hợp lệ |
| POST | /api/auth/reset-password | email, otp, newPassword | Đặt mật khẩu mới |
| POST | /api/auth/user_register | ADMIN Bearer; email, roleId, employeeId tùy role | 201, user mới IN_PROCESS |

Body dạng JSON. Database mới có ADMIN, HR, EMPLOYEE. ADMIN tạo HR hoặc EMPLOYEE; EMPLOYEE bắt buộc liên kết employeeId có sẵn, chưa gắn tài khoản khác. fullName được đọc từ employees, không gửi khi tạo user. Tài khoản ADMIN đầu tiên do nhóm trưởng thiết lập.
Các đường dẫn `/api/v1/auth/*` vẫn dùng được. Login ở đó trả thêm access_token/expires_in; /me trả `{data: user}`.

Lỗi chính: 400 sai dữ liệu/reset token, 401 sai thông tin đăng nhập/token, 403 tài khoản inactive hoặc thiếu quyền, 409 email trùng, 429 quá nhiều request, 500 lỗi server, 503 SMTP chưa cấu hình.

## Cấu hình

- Dùng schema nhóm trưởng quản lý. Backend không tạo bảng hay chạy migration.
- Account API cần SELECT trên role và employees; SELECT/INSERT/UPDATE trên users; INSERT trên audit_logs và USAGE sequence của users/audit_logs. Không còn API sửa fullName/email (UM-03).
- Email được chuẩn hóa trong API. Tạo user có khóa giao dịch theo email để tránh hai request API cùng tạo trùng; dữ liệu nhập trực tiếp qua công cụ khác vẫn cần nhóm kiểm tra.
- `.env` đặt ROLE_ADMIN=ADMIN, ROLE_HR=HR, ROLE_EMPLOYEE=EMPLOYEE.
- Local HTTP: `AUTH_COOKIE_SECURE=false`. Production: HTTPS và `AUTH_COOKIE_SECURE=true`.
- SMTP: điền SMTP_HOST, SMTP_PORT, SMTP_FROM và thông tin xác thực nếu cần. Port 587 dùng STARTTLS; port 465 đặt SMTP_SECURE=true.
- Không có SMTP thì forgot-password trả 503. Không log OTP hoặc token.

## Test bằng PowerShell trong VS Code

Giữ backend đang chạy, mở terminal PowerShell khác. Nhập email và mật khẩu tài khoản ERIS khi được hỏi:

```powershell
$credential = Get-Credential -Message 'Tai khoan ERIS'
$body = @{ email = $credential.UserName; password = $credential.GetNetworkCredential().Password } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -ContentType 'application/json' -Body $body -SessionVariable erisSession
$login.user
Remove-Variable body, credential

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/me' -Headers @{ Authorization = "Bearer $($login.accessToken)" }
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/refresh' -Method Post -WebSession $erisSession
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/logout' -Method Post -WebSession $erisSession

try {
    Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/refresh' -Method Post -WebSession $erisSession
} catch {
    $_.Exception.Response.StatusCode
}
```

Kỳ vọng: login/me/refresh/logout thành công; refresh cuối trả 401 vì cookie jar đã xóa cookie. Nếu cố gửi lại bản cookie cũ thì refresh vẫn thành công đến hạn. Mở URL login trên thanh địa chỉ trình duyệt gửi GET, trong khi login cần POST.

## Cách phiên đăng nhập hoạt động

Access JWT mặc định 1 giờ; refresh JWT 7 ngày cố định, không tự gia hạn. Refresh token nằm trong cookie HttpOnly; không lưu token vào database. Frontend dùng `credentials: 'include'` và Origin đúng cấu hình. Mỗi lần refresh vẫn kiểm tra chữ ký, hạn dùng và trạng thái user trong database.

Logout, đổi/reset mật khẩu đều xóa cookie trên trình duyệt hiện tại. Access và refresh token đã sao chép hoặc còn ở thiết bị khác vẫn có hiệu lực đến hạn; không có chức năng revoke hoặc logout toàn bộ thiết bị. Đây là thay đổi so với yêu cầu thu hồi phiên trong file Word ban đầu. User INACTIVE bị từ chối truy cập/refresh; bật lại ACTIVE thì token chưa hết hạn có thể dùng lại.

OTP gồm 6 chữ số, mặc định 15 phút, chỉ dùng một lần; yêu cầu OTP mới thay OTP cũ. Login của user IN_PROCESS gửi OTP đổi mật khẩu và passwordChangeToken, chưa cấp accessToken cho nghiệp vụ.

Mật khẩu mới: tối thiểu 12 ký tự, có chữ hoa/thường, số, ký tự đặc biệt, tối đa 72 byte UTF-8. Password dùng bcrypt. Tạo user và audit cùng transaction; đổi/reset password cũng commit cùng audit.

Rate limit đang lưu trong RAM; nếu chạy nhiều server thì cần dùng store chung. Test PGlite chỉ có một kết nối, nên vẫn cần test đồng thời trên PostgreSQL thật. Chưa test gửi email qua SMTP thật.
