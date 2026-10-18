# API backend

Các API nghiệp vụ dùng `/api/v1`, trả JSON và yêu cầu header `Authorization: Bearer <access_token>`.

Employee Management hiện có 4 API theo thiết kế mới: POST/GET `/api/employees`, GET/PATCH `/api/employees/:id`, đồng thời hỗ trợ prefix `/api/v1`. Chỉ HR truy cập. Response dùng camelCase, detail/create/update trả đối tượng trực tiếp; xem [hợp đồng và request mẫu](../backend/docs/employee-management.md). `POST /api/distance/resolve-address` hỗ trợ xem trước khoảng cách trên form trước khi lưu.

## Auth

Auth dùng `/api/auth`. ADMIN tạo tài khoản qua `POST /api/auth/user_register`. Request, response và cách test ghi trong [authentication.md](authentication.md). Schema hiện tại được mô tả trong [bản đối chiếu database](../backend/docs/database-schema-update.md).

Đường dẫn auth cũ `/api/v1/auth` vẫn hoạt động. Các đường dẫn trong bảng dưới đều thêm `/api/v1` ở đầu.

## Đọc dữ liệu

Các resource dưới đây đều hỗ trợ `GET /resource` và `GET /resource/:id`.

| Resource | Nhóm quyền | Query lọc |
|---|---|---|
| users | admin | roleId, search (email/tên nhân viên liên kết), status |
| roles | admin | — |
| departments | Chỉ HR | q (code/name) |
| positions | Chỉ HR | q (code/name) |
| employees | HR | department_id, position_id, q (code/name/email) |
| snapshots | HR | employee_id, department_id, position_id |
| models | HR | created_by |
| predictions | HR | employee_id, snapshot_id, prediction_run_id |
| explanations | HR | prediction_result_id |
| retention-actions | HR | HTTP 503: không có bảng trong schema mới |
| outcomes | HR | HTTP 503: không có bảng trong schema mới |
| audit | admin | user_id, entity_id |

Quyền đang khai báo ở `common/permissions.js`. ADMIN quản lý tài khoản, chưa được cấp quyền xem hồ sơ nhân viên. Hiện chưa giới hạn dữ liệu theo phòng ban.

Theo yêu cầu mới của nhóm trưởng, Department/Position có thêm POST và PATCH, chỉ HR được gọi; alias `/api/departments`, `/api/positions` cũng hoạt động. Xem [request và quy tắc kiểm tra](../backend/docs/database-schema-update.md). API UM-03 `PATCH /api/users/:id` đã bỏ; UM-04 chỉ khóa `INACTIVE`, không hỗ trợ unlock. Danh sách user chỉ lọc `ACTIVE`/`INACTIVE`.

List: `?page=1&limit=20`, limit tối đa 100, thứ tự id giảm dần. Trả:

```json
{"data":[],"pagination":{"page":1,"limit":20,"has_more":false}}
```

Detail: `{"data":{...}}` cho resource đọc chung; user management và Employee Management trả trực tiếp đối tượng. ID không tồn tại trả 404. Các cột PostgreSQL numeric được driver pg trả dạng string để giữ độ chính xác; không ép số tiền thành floating point. Query chưa được hỗ trợ trả 400; user management và Employee Management có total count/hasMore, các resource đọc còn lại dùng has_more.

## Dashboard và report

- `GET /dashboard/summary`: HR/analyst; số nhân viên ACTIVE và số lượng LOW/MEDIUM/HIGH/unassessed theo phòng ban. Mỗi người chỉ lấy prediction mới nhất; không chỉ đếm prediction của model đang active.
- `GET /reports/departments.csv`: cùng phạm vi và quyền; CSV tổng hợp, escape công thức spreadsheet.

## Validation / AI

- `GET /data-validation/catalog`: analyst, trả cả 35 cột cùng model_feature_count=25.
- `POST /data-validation/features`: analyst, body là object có đúng 25 feature theo CSV; valid → 200, lỗi dữ liệu → 422. Không đưa EmployeeNumber, Attrition, Gender, MaritalStatus vào object.
- `POST /data-validation/batch`: analyst, body `{"rows":[{...}]}`; 1–100 rows. Chỉ validate JSON, **không phải endpoint upload CSV hoặc nhập vào database**.
- `POST /predictions`: analyst, hiện trả 503 `MODEL_NOT_READY`. Chưa gọi service Python, không lưu prediction.

## Vận hành và lỗi

- `GET /health/live`: public, 200 khi process chạy.
- `GET /health/ready`: public, 200 khi SELECT 1 chạy được; lỗi database → 503.
- Lỗi: `{"error":{"code":"...","message":"...","request_id":"..."}}`.
- 400 sai ID/query/JSON; 401 thiếu token hoặc sai đăng nhập; 403 không đủ quyền; 404 không tìm thấy; 413 body quá lớn; 422 validation; 429 rate limit; 500 lỗi nội bộ đã che chi tiết; 503 dependency chưa sẵn sàng. Rate-limit sử dụng response mặc định của middleware.
- Request logs không ghi headers/token, body, search text hoặc dữ liệu nhân viên. Audit_logs API chỉ đọc dữ liệu đã có; request log không thay thế audit nghiệp vụ.
