# Kết quả kiểm tra scaffold — 08/09/2026

## Đã chạy

- Cài dependencies bằng npm, có package-lock.json để dùng npm ci.
- `npm.cmd test`: **21 tests passed, 0 failed**, Node.js 24.14.0.
- HTTP integration tests chạy server Express trên loopback với database adapter giả lập: login, JWT, role, status inactive, 401/403, lỗi JSON và lỗi dependency.
- Unit tests cho 25 features, chặn target/audit attributes, thiếu dữ liệu, thang điểm, categorical vocabulary, không ép kiểu và warnings ngoài observed range.
- Kiểm tra query binding, pagination, không chọn password_hash trong users API, CSV formula escaping.
- So khớp tĩnh tên bảng/cột của **12 repository** với SQL nguồn: khớp.

## Chưa kiểm chứng

- Không kết nối, đọc dữ liệu hoặc thay đổi database VPS. Chưa test truy vấn với PostgreSQL thật, dữ liệu role/user, bcrypt hash hiện có hoặc chứng chỉ TLS.
- Chưa chạy Python/FastAPI và Docker build: không có Python/Docker runtime khả dụng được xác định trong môi trường làm việc.
- Chưa có model, dataset, preprocessing hay SHAP artifact; không có kết quả chất lượng AI.
- Chưa kiểm thử tải, nhiều instance, rollout production hoặc phân quyền cấp tổ chức/phòng ban.

API tests dùng mock DB nên không chứng minh được database permission, SQL execution và dữ liệu thực tương thích. Cần chạy integration tests với database development sau khi cấu hình kết nối.

CSV là nguồn catalog. Sau khi sửa CSV, chạy `powershell -File contracts/sync-catalog.ps1` từ thư mục gốc để sinh lại JSON, rồi chạy test backend. Khi thay đổi lựa chọn feature, phải cập nhật model contract, tài liệu và các assertion số lượng có chủ đích.
