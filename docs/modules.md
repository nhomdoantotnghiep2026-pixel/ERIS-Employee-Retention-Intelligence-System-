# Module backend và việc còn lại

| Module/thư mục | Bảng | Đã có | Việc tiếp theo |
|---|---|---|---|
| auth | users + roles | Login, JWT, /me, status và RBAC | Kiểm tra thuật toán hash thực tế, refresh/logout, reset password |
| users | users | List/detail loại bỏ hash | Tạo/sửa/khóa user, ghi audit |
| roles | roles | List/detail cho admin | Quản lý role; chốt ma trận quyền |
| departments | departments | List/detail/search | CRUD và xử lý tham chiếu |
| positions | positions | List/detail/search | CRUD; ánh xạ title/level sang model |
| employees | employees | List/detail/search, lọc department/position/manager | CRUD, email/code unique, chống vòng lặp manager |
| snapshots | employee_snapshots | List/detail theo employee | Snapshot bất biến, validation nghiệp vụ và nhập dữ liệu |
| data-validation | Không ghi DB | Catalog, validate features/batch JSON | CSV parsing, preview, import transaction và lưu lỗi import |
| models | model_versions | List/detail | Đăng ký artifact/metrics, activate an toàn, feature contract |
| predictions | predictions | List/detail; POST trả MODEL_NOT_READY | Chuẩn bị snapshot, gọi AI, lưu prediction + factors atomic |
| explanations | prediction_factors | List/detail theo prediction | Chốt nghĩa SHAP, output scale, baseline, tính đầy đủ |
| dashboard/reports | employees + departments + predictions | Latest risk per active employee, CSV phòng ban | Bộ lọc thời gian, so sánh, kiểm thử dữ liệu thực |
| retention-actions | retention_actions | List/detail | HR tạo/cập nhật kế hoạch và trạng thái bằng thao tác người dùng |
| outcomes | employee_outcomes | List/detail | HR ghi nhận outcome; quy tắc label theo horizon |
| audit | audit_logs | Admin đọc list/detail | Audit mutations atomic, redaction và chính sách retention |
| system | Chưa có bảng config | Health, JSON request log và error handler | Configuration, metrics, cảnh báo vận hành |

Thiết kế mỗi module đọc: `routes → service → repository → PostgreSQL`. Helper chung giảm lặp pagination, xử lý ID và truy vấn. Routes đóng vai trò HTTP controller; không tạo thêm controller trống chỉ để đủ tên file.

Các API ghi chưa được đăng ký, trừ POST login, validation và POST predictions báo chưa sẵn sàng. Endpoint chưa có trả 404. Không coi việc có folder/module là đã hoàn thành chức năng nghiệp vụ.

## Những ràng buộc cần bổ sung khi phát triển

- predictions.employee_id và snapshot_id hiện là hai FK riêng; cần đảm bảo snapshot thuộc đúng employee.
- retention_actions.prediction_id cũng phải thuộc đúng employee_id.
- model_versions chưa giới hạn chỉ một is_active=true. Cần chiến lược transaction/lock và unique partial index sau khi kiểm tra dữ liệu cũ.
- employees.manager_id chưa ngăn tự quản lý hoặc chu trình nhiều nhân viên.
- snapshots nhiều cột nullable/decimal, khác contract AI bắt buộc integer: xem feature-mapping.md.
- retention_actions.scheduled_date/completed_at là timestamp không timezone: nhóm phải thống nhất múi giờ trước khi viết API.
- Schema không có bảng cấu hình, import_jobs, prediction_jobs, dataset/feature version, quyền theo department hoặc tenant. Bản này giả định một tổ chức; HR/analyst có quyền dữ liệu toàn tổ chức.
- Không dùng RESIGNED/TERMINATED tự động suy ra nhãn IBM Attrition khi chưa chốt mục tiêu, thời điểm và observation horizon. STAYED chỉ có ý nghĩa nhãn âm sau khi quan sát đủ khoảng thời gian.

Tài liệu đề xuất Supabase, database hiện tại là PostgreSQL riêng. Bản scaffold dùng driver pg và users/roles sẵn có. Việc chuyển Supabase là quyết định kiến trúc riêng, không thực hiện trong bước dựng file này.
