# Đồng bộ API với database nhóm trưởng cập nhật

Đối chiếu trực tiếp schema PostgreSQL ngày 18/10/2026. Backend chỉ đọc schema và dữ liệu khi kiểm tra; không tạo bảng, không khôi phục tài khoản cũ và không chạy migration trên VPS.

## Các API thay đổi

| API | Bảng/cột đang dùng |
| --- | --- |
| Auth, user management, roles | `role`; `users.employee_id` liên kết `employees.id` |
| Employees | `current_salary`, `address`, `distance_from_home_km`, `phone`, `employment_type`; không còn `salary` hoặc `manager_id` trực tiếp |
| Positions | `code`, `name`, `job_level`, `status` thay `title`, `level` |
| Departments | thêm `code`, `status` |
| `/api/v1/snapshots` | `ai_input`; khoảng cách `distance_from_home_km`, giờ tăng ca `overtime_hours` |
| `/api/v1/models` | `model_run`; trả thông tin đợt chạy model, không còn các chỉ số accuracy/precision/recall của bảng `model_versions` cũ |
| `/api/v1/predictions` (GET) | `prediction_results`; `prediction_run_id`, `attrition_probability`, `prediction_label`, `created_at` |
| `/api/v1/explanations` | `explainable`; `prediction_result_id`, `feature_name`, `feature_value`, `impact_value`, `rank_order` |
| Audit | `old_value`, `new_value` thay `details` |
| Dashboard / báo cáo | chọn prediction mới nhất từ `prediction_results` theo `created_at`, `id` |
| Retention actions / outcomes | Schema hiện không có bảng tương ứng; trả HTTP 503 `FEATURE_UNAVAILABLE` |

Tên đường dẫn API cũ giữ nguyên, trường dữ liệu trả về và bộ lọc dùng tên cột mới. Query filter không hỗ trợ sẽ trả HTTP 400 thay vì bị bỏ qua. Ví dụ: dùng `prediction_run_id` thay `model_version_id`, `prediction_result_id` thay `prediction_id`. Bộ lọc `employees?manager_id=...` không còn được hỗ trợ vì manager hiện ở lịch sử công việc.

## Tài khoản và phân quyền

Database hiện có đúng 3 role: `1 = ADMIN`, `2 = HR`, `3 = EMPLOYEE` tại lần đối chiếu. `.env` dùng `ROLE_HR=HR` và `ROLE_EMPLOYEE=EMPLOYEE` (mặc định). Backend không còn nhóm quyền HR_MANAGER/DATA. Client lấy danh sách role từ `GET /api/roles` thay vì suy đoán ID.

- ADMIN quản trị tài khoản, role, audit và dùng các demo.
- HR quản lý Department/Position, đọc dữ liệu nhân sự, đợt chạy model, dự đoán, dashboard; kiểm tra dữ liệu và import khoảng cách.
- EMPLOYEE chỉ đọc tài khoản của mình, đổi mật khẩu qua auth; không được xem danh sách nhân viên hoặc import khoảng cách của HR.
- Theo tin nhắn cập nhật của nhóm trưởng, chỉ HR được dùng Department/Position (cả đọc và ghi); ADMIN và EMPLOYEE nhận 403.
- UM-03 (`PATCH /api/users/:id`, cả alias `/api/v1/users/:id`) đã bỏ. UM-04 chỉ khóa INACTIVE, không mở khóa ACTIVE; bộ lọc danh sách user chỉ nhận ACTIVE/INACTIVE theo file test case.

`users` không còn `full_name`. Các API trả `fullName` lấy từ nhân viên liên kết; tài khoản không có liên kết trả `null`. `employeeId` được trả trong thông tin tài khoản.

Tạo tài khoản mới bằng ADMIN:

```json
{
  "email": "employee@example.com",
  "roleId": 3,
  "employeeId": 123
}
```

`employeeId` phải là nhân viên đã tồn tại và chưa liên kết với tài khoản khác. Role EMPLOYEE bắt buộc có liên kết; HR có thể không có. Không gửi `fullName` khi đăng ký tài khoản; tên thuộc hồ sơ nhân viên. Không còn API PATCH user để sửa tên/email (UM-03). Việc tạo user vẫn yêu cầu SMTP, gửi mật khẩu ban đầu và trạng thái `IN_PROCESS` như trước.

## Department / Position theo yêu cầu mới

Cả `/api` và `/api/v1` đều hỗ trợ: GET `/departments`, GET `/departments/:id`, POST `/departments`, PATCH `/departments/:id`; tương tự với `/positions`. Tất cả yêu cầu Bearer token HR.

Department tạo bằng `{ "name": "Engineering", "description": null }`. Position tạo bằng `{ "name": "Engineer", "jobLevel": "Senior" }`; cũng nhận `title`/`level` để tương thích request trong file test case. Level gồm Junior, Senior, Lead, Manager, Director; không được null.

Schema mới bắt buộc `code`: API nhận code do HR điền (tối đa 50 ký tự) hoặc tự tạo code duy nhất nếu bỏ trống. Response trả tên cột database: `name`, `job_level`, `code`. Tên Department và cặp name + job_level của Position được kiểm tra trùng không phân biệt hoa thường; code cũng phải duy nhất. Mỗi lần tạo/sửa có thay đổi ghi audit `old_value`/`new_value` trong cùng transaction; lỗi audit rollback cả thao tác. Không có API xóa trong phạm vi file test case.

File Excel tham chiếu còn ghi ADMIN cho Department/Position và các role HR_MANAGER/HR_STAFF/DATA; tin nhắn mới của nhóm trưởng được áp dụng thay các phần cũ đó. Chữ “đi” sau “bỏ UM-3” là diễn đạt trong tin nhắn, không phải API/module DI.

## Kiểm tra lại khi nhóm trưởng đổi schema

Từ thư mục `backend`:

```powershell
node --env-file=.env scripts/check-database-schema.js
node --test --test-isolation=none
```

Lệnh đầu chạy trong transaction `READ ONLY`, kiểm tra các repository hiện có, không in email hoặc password hash. Test dùng snapshot schema trong `test-support/team-schema.js` trên PostgreSQL nhúng riêng; không seed tài khoản lên VPS.

Sau khi thay schema, database có thể chưa có tài khoản. Lệnh kiểm tra phía trên in số tài khoản hiện có; nếu bằng 0, nhóm cần seed ADMIN đầu tiên trước khi đăng nhập. Tài khoản cũ không tự chuyển qua khi schema/dữ liệu đã được thay mới.
