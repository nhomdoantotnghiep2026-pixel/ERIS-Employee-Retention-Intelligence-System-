# Mapping dữ liệu cho model v1

File `feature_catalog_v0.csv` có 35 cột, trong đó 25 cột được chọn cho model v1.

Database còn thiếu một số feature. Bảng dưới ghi nguồn dữ liệu có thể dùng và những chỗ nhóm cần thống nhất trước khi nối với model. `snapshots` là bảng `employee_snapshots`.

| Feature | Nguồn có thể dùng | Điều kiện / phần thiếu |
|---|---|---|
| Age | employees.date_of_birth + snapshot_date | Tính tuổi tại snapshot, không dùng tuổi hôm chạy lại |
| BusinessTravel | Chưa có | Cần thêm dữ liệu về tần suất công tác |
| Department | departments.name qua employee | Cần map tên phòng ban sang 3 giá trị trong CSV |
| DistanceFromHome | snapshots.distance_from_home | DB decimal, model integer; cần chốt đơn vị, không tự làm tròn |
| Education | Chưa có | Code 1–5 |
| EducationField | Chưa có | Dùng các giá trị được liệt kê trong CSV |
| EnvironmentSatisfaction | snapshots.environment_satisfaction | DB 1–5; model 1–4 |
| JobInvolvement | snapshots.job_involvement | DB 1–5; model 1–4 |
| JobLevel | positions.level | DB lưu chuỗi; cần quy định cách đổi sang số nguyên 1–5 |
| JobRole | positions.title | Cần map chức danh sang các giá trị trong CSV |
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
| YearsAtCompany | snapshots.years_at_company | Cần thống nhất cách chuyển số năm sang số nguyên |
| YearsInCurrentRole | snapshots.years_in_current_role | Cần thống nhất cách chuyển số năm sang số nguyên |
| YearsSinceLastPromotion | snapshots.years_since_last_promotion | Cần thống nhất cách chuyển số năm sang số nguyên |
| YearsWithCurrManager | Chưa có | manager_id không cho biết thời gian làm việc cùng quản lý |

Hiện thiếu 9 feature. Có 4 feature cần tính hoặc map từ hồ sơ nhân viên; 12 feature đã có cột trong snapshot nhưng còn lệch kiểu dữ liệu hoặc thang điểm.

## Khi kiểm tra dữ liệu

- Dùng giới hạn trong `project_validation_rule`. Khoảng `observed_values_or_range` chỉ để cảnh báo; ví dụ Age=65 vẫn qua validation nhưng có warning.
- Chưa có đủ quy tắc nghiệp vụ cho mọi cột, như tuổi âm hoặc thâm niên không hợp lý. Nếu bổ sung, cần cập nhật catalog cùng phiên bản model.
- Dữ liệu thiếu hoặc sai kiểu sẽ báo lỗi. Backend chưa tự điền giá trị, làm tròn số hay đổi thang điểm.
- Hồ sơ hiện tại chưa lưu lịch sử phòng ban, vị trí và quản lý. Cần bổ sung nếu muốn dự đoán lại từ snapshot cũ.
- Age vẫn được dùng nhưng cần kiểm tra độ lệch giữa các nhóm. Gender và MaritalStatus chỉ dùng để đánh giá fairness. Giá trị OTHER của Gender trong DB chưa có trong CSV, cần xử lý riêng.
- Attrition là nhãn, EmployeeNumber là định danh. Các cột hằng và DailyRate/HourlyRate/MonthlyRate không đưa vào model.
- Trước khi lấy nhãn từ `employee_outcomes`, cần chốt loại nghỉ việc và khoảng thời gian theo dõi.

## Việc cần làm tiếp

1. Thống nhất với phần AI về feature còn thiếu, đơn vị và cách map dữ liệu rồi mới bổ sung schema.
2. Chuẩn bị dataset để train. CSV hiện tại chỉ mô tả feature; bước tiền xử lý phải fit trên tập train để tránh lộ dữ liệu test.
3. Khi bàn giao model, kèm preprocessing, thứ tự feature, nhãn, ngưỡng phân loại, phiên bản và kết quả đánh giá.
4. Lưu prediction và SHAP cùng snapshot/model trong một transaction. Cần chốt dấu đóng góp, đơn vị SHAP và bổ sung chỗ lưu baseline, thang đầu ra, phiên bản đầu vào.
