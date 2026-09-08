# ERIS — Backend scaffold theo database TalentGuard

Bộ khung backend Node.js/Express + PostgreSQL và service Python/FastAPI, dựng từ `schema.sql` người dùng cung cấp ngày 08/09/2026. Database nguồn dùng PostgreSQL 17.11 trên VPS; PostgreSQL 18 local là instance khác.

**Trạng thái: scaffold có các API đọc dữ liệu, đăng nhập và validation chạy được; chưa phải backend đầy đủ nghiệp vụ.** Chưa kết nối VPS, chưa thực thi SQL lên database của nhóm. Không có dữ liệu nhân viên hoặc model đã train trong repo.

## Bắt đầu

1. Đọc [hướng dẫn chạy](docs/setup.md).
2. Điền thông tin database và tên role trong `backend/.env` dựa trên `.env.example`.
3. Chạy trong thư mục `backend`:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run start:local
```

## Những gì đã dựng

- Module riêng cho 12 bảng: users, roles, departments, positions, employees, employee_snapshots, model_versions, predictions, prediction_factors, retention_actions, employee_outcomes, audit_logs.
- Mỗi module có routes, service, repository; cùng dùng helper truy vấn có tham số, phân trang giới hạn 100 bản ghi.
- Đăng nhập bằng bcrypt + JWT; tải lại trạng thái và role mỗi request; từ chối role không được cấu hình. API users không trả password_hash.
- Dashboard đếm kết quả mới nhất của từng nhân viên ACTIVE; báo cáo CSV tổng hợp phòng ban.
- Validation đầu vào dự đoán và batch JSON theo **25 feature** `use_in_model_v1=TRUE`; kiểm tra thiếu dữ liệu, enum, integer, khoảng bắt buộc và cảnh báo ngoài khoảng quan sát.
- Dockerfile, Compose, cấu hình mẫu, test tự động và tài liệu phân công.
- Service AI có liveness và hợp đồng đầu vào cơ bản; readiness/predict trả `503 MODEL_NOT_READY` cho đến khi tích hợp model thật.

## Tài liệu

- [Module và trạng thái triển khai](docs/modules.md)
- [API và phân quyền](docs/api.md)
- [Đối chiếu database với feature model](docs/feature-mapping.md)
- [Cách chạy và kết nối](docs/setup.md)
- [Kết quả kiểm thử và giới hạn](docs/testing.md)
- [Schema tham chiếu](database/schema.reference.sql)
- [Danh mục feature gốc](contracts/feature_catalog_v0.csv)

## Các phần cần phát triển tiếp

CRUD/nhập CSV vào database, ghi audit log nghiệp vụ, quản lý tài khoản/role qua API, workflow HR, lưu prediction + SHAP trong transaction, model training/evaluation/version activation, cấu hình hệ thống và kiểm thử database thực. Các API đọc đã có chỉ phục vụ việc dựng nền tảng. Chưa có endpoint tự thực hiện quyết định nhân sự.

SQL trong `database/schema.reference.sql` là bản tham chiếu nguyên gốc, **không phải migration tự chạy**. Cấu hình kết nối dùng PostgreSQL trực tiếp vì schema hiện tại chứa users/password_hash riêng; chưa giả định Supabase Auth.
