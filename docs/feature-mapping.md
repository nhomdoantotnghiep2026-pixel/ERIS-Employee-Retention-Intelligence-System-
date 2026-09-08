# Đối chiếu schema TalentGuard và model v1

Nguồn: schema.sql người dùng cung cấp và feature_catalog_v0.csv. CSV có **35 cột, 25 cột TRUE**, 10 cột không dùng trong model v1. Số 24 đã nêu trong trao đổi trước là nhầm; mã nguồn và kiểm thử dùng 25.

Database hiện chưa đủ để tự dựng một vector hợp lệ cho model. Bảng dưới là **đề xuất mapping**, chưa phải pipeline production đã được xác nhận.

| Feature | Nguồn có thể dùng | Điều kiện / phần thiếu |
|---|---|---|
| Age | employees.date_of_birth + snapshot_date | Tính tuổi tại snapshot, không dùng tuổi hôm chạy lại |
| BusinessTravel | Chưa có | Bổ sung dữ liệu/vocabulary |
| Department | departments.name qua employee | Phải map đúng 3 category benchmark; tên tự do không mặc định tương đương |
| DistanceFromHome | snapshots.distance_from_home | DB decimal, model integer; cần chốt đơn vị, không tự làm tròn |
| Education | Chưa có | Code 1–5 |
| EducationField | Chưa có | Vocabulary CSV |
| EnvironmentSatisfaction | snapshots.environment_satisfaction | DB 1–5; model 1–4 |
| JobInvolvement | snapshots.job_involvement | DB 1–5; model 1–4 |
| JobLevel | positions.level | DB varchar tự do; cần ánh xạ được duyệt sang integer 1–5 |
| JobRole | positions.title | Cần ánh xạ đúng vocabulary CSV |
| JobSatisfaction | snapshots.job_satisfaction | DB 1–5; model 1–4 |
| MonthlyIncome | snapshots.monthly_income | DB có phần thập phân, model integer; chốt tiền tệ và đơn vị. Không tự lấy employees.salary thay thế |
| NumCompaniesWorked | Chưa có | Integer 0–9 |
| OverTime | snapshots.overtime | true→Yes, false→No; null phải lỗi |
| PercentSalaryHike | Chưa có | Integer 11–25 |
| PerformanceRating | snapshots.performance_rating | DB 1–5; model chỉ 3–4 |
| RelationshipSatisfaction | Chưa có | Integer 1–4 |
| StockOptionLevel | Chưa có | Integer 0–3 |
| TotalWorkingYears | Chưa có | Không tương đương YearsAtCompany |
| TrainingTimesLastYear | snapshots.training_times_last_year | Model 0–6; DB chưa có CHECK này |
| WorkLifeBalance | snapshots.work_life_balance | DB 1–5; model 1–4 |
| YearsAtCompany | snapshots.years_at_company | Decimal→integer cần quy tắc được duyệt |
| YearsInCurrentRole | snapshots.years_in_current_role | Decimal→integer cần quy tắc được duyệt |
| YearsSinceLastPromotion | snapshots.years_since_last_promotion | Decimal→integer cần quy tắc được duyệt |
| YearsWithCurrManager | Chưa có | manager_id không cho biết thời gian làm việc cùng quản lý |

**9 feature chưa có nguồn riêng**; 4 feature cần tính/ánh xạ từ hồ sơ, phòng ban, vị trí; 12 feature có cột snapshot tương ứng nhưng cần xác nhận thang điểm, kiểu dữ liệu và ý nghĩa.

## Nguyên tắc validation

- Chỉ `project_validation_rule` với range bắt buộc mới tạo lỗi range. `observed_values_or_range` không phải giới hạn nghiệp vụ: giá trị ngoài khoảng quan sát tạo warning. Ví dụ Age=65 được cảnh báo, không bị bác bỏ chỉ vì benchmark có tuổi tối đa 60.
- Đây là validation theo catalog, chưa thay thế mọi quy tắc hợp lý nghiệp vụ. Catalog không quy định range cho một số cột nên nhóm cần bổ sung quy tắc riêng có phiên bản nếu muốn bác bỏ tuổi âm, quan hệ thâm niên bất hợp lý, v.v.
- Không impute dữ liệu thiếu, không ép chuỗi thành số, không làm tròn decimal, không tự đổi thang điểm 1–5 sang 1–4.
- Feature snapshot phải phản ánh thời điểm dự đoán. Department, position và manager trong employees là dữ liệu hiện tại; chưa lưu lịch sử thay đổi, nên không join hồ sơ hiện tại để tái dựng tùy tiện feature lịch sử.
- Age được giữ theo catalog nhưng là sensitive feature cần đánh giá fairness. Gender và MaritalStatus chỉ audit, không là model input. Gender DB có OTHER trong khi catalog chỉ Female/Male: audit cần chính sách riêng, không ép OTHER sang nhóm khác.
- Attrition là y, EmployeeNumber là ID, EmployeeCount/Over18/StandardHours là constant, DailyRate/HourlyRate/MonthlyRate bị loại do định nghĩa chưa rõ.
- employee_outcomes không tự tương đương y=Attrition. Nhóm cần định nghĩa nghỉ việc tự nguyện hay mọi loại rời công ty, horizon, ngày snapshot và cửa sổ quan sát.

## Trước khi tích hợp AI

1. Chốt schema bổ sung 9 feature và mapping 4 feature với nhóm database/AI; chuẩn bị migration có review, chưa áp dụng lên VPS.
2. Chốt nguồn dữ liệu, đơn vị, availability và policy snapshot; cập nhật catalog có phiên bản nếu đổi contract.
3. Train/evaluate trên dataset thực sự (catalog không phải training dataset); tránh leakage theo người/thời điểm và fit preprocessing trên train.
4. Artifact phải chứa preprocessing, thứ tự feature, class mapping, threshold, model version và thông tin đánh giá.
5. Lưu prediction + SHAP cùng snapshot/model trong transaction. Chốt POSITIVE nghĩa tăng xác suất nghỉ việc; ghi rõ SHAP đang ở probability hay log-odds. Schema hiện chưa lưu baseline/output scale/input vector version.
