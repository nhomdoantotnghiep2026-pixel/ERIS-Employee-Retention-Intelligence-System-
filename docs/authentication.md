# Authentication

Gồm 7 API auth và API tạo tài khoản theo file đặc tả. Chỉ ADMIN được tạo tài khoản.

## API

| Method | Endpoint | Đầu vào | Kết quả |
|---|---|---|---|
| POST | /api/auth/login | email, password | accessToken, user; cookie refresh |
| GET | /api/auth/me | Bearer accessToken | id, email, fullName, role, status |
| POST | /api/auth/refresh | Cookie eris_refresh | accessToken mới |
| POST | /api/auth/logout | Cookie eris_refresh | Thu hồi phiên, xóa cookie |
| PATCH | /api/auth/change-password | Bearer; currentPassword, newPassword | Đổi mật khẩu, yêu cầu đăng nhập lại |
| POST | /api/auth/forgot-password | email | Thông báo chung, gửi link nếu account hợp lệ |
| POST | /api/auth/reset-password | token, newPassword | Đặt mật khẩu mới |
| POST | /api/users | ADMIN Bearer; email, password, fullName, role | 201, user mới |

Body dạng JSON. Role được tạo: HR_MANAGER, HR_STAFF và role analyst trong `.env` (VPS đang dùng DATA).
Các đường dẫn cũ `/api/v1/auth/*` và `POST /api/v1/users` vẫn dùng được. Login ở đường dẫn cũ trả thêm access_token/expires_in; /me trả `{data: user}`.

Lỗi chính: 400 sai dữ liệu/reset token, 401 sai thông tin đăng nhập/token, 403 tài khoản inactive hoặc thiếu quyền, 409 email trùng, 429 quá nhiều request, 500 lỗi server, 503 SMTP chưa cấu hình.

## Cấu hình

- Migration: `database/migrations/001_auth_sessions.sql`, chỉ chạy một lần. Đã áp dụng trên VPS ngày 12/09/2026.
- Database mới cần kiểm tra email trùng theo `lower(btrim(email))` trước khi chạy migration. Không restore schema gốc đè lên database đã có.
- Account API cần SELECT trên roles; SELECT/INSERT/UPDATE trên users, auth_sessions, password_reset_tokens; INSERT trên audit_logs và USAGE các sequence tương ứng. API đọc audit cần SELECT trên audit_logs.
- `.env` đặt đúng ROLE_ADMIN, ROLE_HR_MANAGER, ROLE_HR_STAFF, ROLE_ANALYST. Tài khoản ADMIN đầu tiên do nhóm thiết lập sẵn.
- Local HTTP: `AUTH_COOKIE_SECURE=false`. Production: HTTPS và `AUTH_COOKIE_SECURE=true`.
- SMTP: điền SMTP_HOST, SMTP_PORT, SMTP_FROM và thông tin xác thực nếu cần. Port 587 dùng STARTTLS; port 465 đặt SMTP_SECURE=true.
- PASSWORD_RESET_URL phải thuộc CORS_ORIGIN. Không có SMTP thì forgot-password trả 503. Không log token hoặc link reset.

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

Kỳ vọng: login/me/refresh/logout thành công; refresh cuối trả 401 (Unauthorized). Không mở URL login trên thanh địa chỉ trình duyệt vì thao tác đó gửi GET, trong khi login cần POST.

## Cách phiên đăng nhập hoạt động

Access token mặc định 15 phút; refresh session 7 ngày, reset token 30 phút. Refresh token nằm trong cookie HttpOnly; database chỉ lưu hash. Frontend dùng `credentials: 'include'` và Origin đúng cấu hình.

Logout thu hồi refresh session hiện tại. Đổi/reset mật khẩu thu hồi mọi refresh session và reset token của user. Access token cũ vẫn có thể dùng đến hạn theo đặc tả, không có blacklist.

Mật khẩu mới: tối thiểu 12 ký tự, có chữ hoa/thường, số, ký tự đặc biệt, tối đa 72 byte UTF-8. Password dùng bcrypt. Tạo user và audit cùng transaction; đổi/reset password cũng commit cùng thu hồi phiên.

Rate limit đang lưu trong RAM; nếu chạy nhiều server thì cần dùng store chung. Test PGlite chỉ có một kết nối, nên vẫn cần test đồng thời trên PostgreSQL thật. Chưa test gửi email qua SMTP thật.
