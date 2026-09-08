# API v0.1

Base path: `/api/v1`. JSON mặc định. Các API dữ liệu yêu cầu `Authorization: Bearer <access_token>`.

## Auth

- `POST /auth/login`: body `{"email":"...","password":"..."}`. Trả access_token, expires_in=900 và user đã loại password_hash.
- `GET /auth/me`: user/status/role đọc lại từ database.

## Đọc dữ liệu

Các resource dưới đây đều hỗ trợ `GET /resource` và `GET /resource/:id`.

| Resource | Nhóm quyền | Query lọc |
|---|---|---|
| users | admin | role_id, q (email/full_name) |
| roles | admin | — |
| departments | tất cả role đã cấu hình | q (name) |
| positions | tất cả role đã cấu hình | q (title) |
| employees | HR staff/manager, analyst | department_id, position_id, manager_id, q (code/name/email) |
| snapshots | HR staff/manager, analyst | employee_id |
| models | HR manager, analyst | — |
| predictions | HR staff/manager, analyst | employee_id, snapshot_id, model_version_id |
| explanations | HR staff/manager, analyst | prediction_id |
| retention-actions | HR staff/manager | employee_id, prediction_id, created_by |
| outcomes | HR staff/manager | employee_id |
| audit | admin | user_id, entity_id |

Admin không tự động có quyền đọc hồ sơ nhân viên. Đây là mặc định tối thiểu cho scaffold; nhóm có thể sửa `common/permissions.js` sau khi chốt RBAC. Không có phân quyền theo phòng ban trong schema.

List: `?page=1&limit=20`, limit tối đa 100, thứ tự id giảm dần. Trả:

```json
{"data":[],"pagination":{"page":1,"limit":20,"has_more":false}}
```

Detail: `{"data":{...}}`. ID không tồn tại trả 404. Các cột PostgreSQL numeric được driver pg trả dạng string để giữ độ chính xác; không ép số tiền thành floating point. Query chưa được hỗ trợ không có tác dụng; không có total count trong v0.1.

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
