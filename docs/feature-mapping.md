# Mapping dữ liệu cho model v1

File `feature_catalog_v0.csv` có 35 cột, trong đó 25 cột được chọn cho model v1.

Database còn thiếu một số feature. Bảng dưới đối chiếu schema ngày 18/10/2026. `snapshots` là bảng `ai_input`; các nguồn dưới đây chưa phải bộ chuyển đổi dữ liệu đã tích hợp vào model.

| Feature | Nguồn có thể dùng | Điều kiện / phần thiếu |
|---|---|---|
| Age | employees.date_of_birth + snapshot_date | Tính tuổi tại snapshot, không dùng tuổi hôm chạy lại |
| BusinessTravel | Chưa có | Cần thêm dữ liệu về tần suất công tác |
| Department | departments.name qua employee | Cần map tên phòng ban sang 3 giá trị trong CSV |
| DistanceFromHome | ai_input.distance_from_home_km | Đơn vị km, numeric; model integer cần thống nhất quy tắc, không tự làm tròn |
| Education | ai_input.education_level / employee_educations.education_level | Chuỗi, cần ánh xạ sang code 1–5 |
| EducationField | employee_educations.field_of_study | Chọn hồ sơ học vấn phù hợp và ánh xạ danh mục model |
| EnvironmentSatisfaction | ai_input.environment_satisfaction | Cần xác minh thang điểm; catalog model yêu cầu 1–4 |
| JobInvolvement | Chưa có cột snapshot | Survey cần thống nhất dimension và cách tổng hợp |
| JobLevel | ai_input.job_level / positions.job_level | DB lưu chuỗi; cần quy định cách đổi sang số nguyên 1–5 |
| JobRole | positions.name | Cần map chức danh sang các giá trị trong CSV |
| JobSatisfaction | ai_input.job_satisfaction | Cần xác minh thang điểm; catalog model yêu cầu 1–4 |
| MonthlyIncome | ai_input.monthly_income | DB numeric, model integer; chốt tiền tệ và đơn vị. Không tự thay bằng current_salary |
| NumCompaniesWorked | employee_work_experiences | Cần quy tắc đếm công ty phân biệt và xử lý các đợt làm việc trùng |
| OverTime | ai_input.overtime_hours | Numeric số giờ; cần xác định kỳ tính và quy tắc chuyển Yes/No |
| PercentSalaryHike | Chưa có | Integer 11–25 |
| PerformanceRating | Chưa có cột snapshot | Model chỉ 3–4 |
| RelationshipSatisfaction | Chưa có | Integer 1–4 |
| StockOptionLevel | Chưa có | Integer 0–3 |
| TotalWorkingYears | ai_input.total_working_years | Numeric, cần quy tắc chuyển kiểu model |
| TrainingTimesLastYear | Chưa có | Model 0–6 |
| WorkLifeBalance | Chưa có cột snapshot | Survey cần thống nhất dimension; model 1–4 |
| YearsAtCompany | snapshots.years_at_company | Cần thống nhất cách chuyển số năm sang số nguyên |
| YearsInCurrentRole | snapshots.years_in_current_role | Cần thống nhất cách chuyển số năm sang số nguyên |
| YearsSinceLastPromotion | snapshots.years_since_last_promotion | Cần thống nhất cách chuyển số năm sang số nguyên |
| YearsWithCurrManager | ai_input.years_with_current_manager | Numeric; đối chiếu employee_job_histories trước khi xây quy tắc tính |

Không dùng số lượng feature/cột của schema cũ để kết luận model đã đủ dữ liệu. Cần chốt nguồn, đơn vị, thang điểm và thời điểm snapshot cho từng feature trước khi tích hợp inference.

## Khi kiểm tra dữ liệu

- Dùng giới hạn trong `project_validation_rule`. Khoảng `observed_values_or_range` chỉ để cảnh báo; ví dụ Age=65 vẫn qua validation nhưng có warning.
- Chưa có đủ quy tắc nghiệp vụ cho mọi cột, như tuổi âm hoặc thâm niên không hợp lý. Nếu bổ sung, cần cập nhật catalog cùng phiên bản model.
- Dữ liệu thiếu hoặc sai kiểu sẽ báo lỗi. Backend chưa tự điền giá trị, làm tròn số hay đổi thang điểm.
- Lịch sử phòng ban, vị trí và quản lý đã có trong employee_job_histories; cần xác định bản ghi có hiệu lực tại thời điểm snapshot.
- Age vẫn được dùng nhưng cần kiểm tra độ lệch giữa các nhóm. Gender và MaritalStatus chỉ dùng để đánh giá fairness. Giá trị OTHER của Gender trong DB chưa có trong CSV, cần xử lý riêng.
- Attrition là nhãn, EmployeeNumber là định danh. Các cột hằng và DailyRate/HourlyRate/MonthlyRate không đưa vào model.
- Schema mới không còn employee_outcomes. Nguồn nhãn nghỉ việc và khoảng thời gian theo dõi cần được nhóm xác định lại.

## Việc cần làm tiếp

1. Thống nhất với phần AI về feature còn thiếu, đơn vị và cách map dữ liệu rồi mới bổ sung schema.
2. Chuẩn bị dataset để train. CSV hiện tại chỉ mô tả feature; bước tiền xử lý phải fit trên tập train để tránh lộ dữ liệu test.
3. Khi bàn giao model, kèm preprocessing, thứ tự feature, nhãn, ngưỡng phân loại, phiên bản và kết quả đánh giá.
4. Lưu prediction và SHAP cùng snapshot/model trong một transaction. Cần chốt dấu đóng góp, đơn vị SHAP và bổ sung chỗ lưu baseline, thang đầu ra, phiên bản đầu vào.
