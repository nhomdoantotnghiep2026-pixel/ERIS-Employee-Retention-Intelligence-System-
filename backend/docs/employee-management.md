# Employee Management API

Triển khai theo tài liệu ERIS Employee Management API Design và schema nhóm trưởng hiện tại. Bốn API đều yêu cầu `Authorization: Bearer <HR access token>`; ADMIN/EMPLOYEE nhận 403. Có cả alias `/api/v1/employees` với cùng hành vi.

| Method | URL | Thành công |
| --- | --- | --- |
| POST | `/api/employees` | 201, đối tượng employee vừa tạo |
| GET | `/api/employees` | 200, `data` và `pagination` |
| GET | `/api/employees/:id` | 200, đối tượng đầy đủ trực tiếp |
| PATCH | `/api/employees/:id` | 200, đối tượng sau cập nhật |

## Tạo hồ sơ

```json
{
  "employeeCode": "EMP001",
  "fullName": "Nguyen Van A",
  "email": "vana@company.com",
  "phone": "0901234567",
  "dateOfBirth": "2000-05-20",
  "gender": "MALE",
  "address": "197 Trần Phú, Phường 4, Quận 5, Hồ Chí Minh",
  "departmentId": 1,
  "positionId": 1,
  "hireDate": "2026-01-10",
  "employmentType": "FULL_TIME",
  "employmentStatus": "ACTIVE",
  "currentSalary": 15000000
}
```

Bắt buộc `employeeCode`, `fullName`, `departmentId`, `positionId`, `hireDate`. Thay các ID ví dụ bằng ID thật từ `/api/departments`, `/api/positions`. Hai bản ghi liên quan phải tồn tại và ACTIVE. Các trường tùy chọn chưa có thông tin có thể để null; employmentStatus mặc định ACTIVE và không được null.

Mã nhân viên tối đa 50 ký tự, họ tên 150, email 255, điện thoại 30, địa chỉ 300. Email được trim và chuyển chữ thường. Mã/email được kiểm tra trùng không phân biệt hoa thường. Gender hỗ trợ MALE/FEMALE/OTHER; employmentType và employmentStatus là chuỗi theo schema, chuyển thành chữ hoa. Tài liệu chưa định nghĩa danh sách đóng cho hai trường này.

Ngày phải đúng lịch theo YYYY-MM-DD, không chấp nhận ngày tự tràn sang tháng sau. Ngày sinh không ở tương lai theo giờ Việt Nam; ngày vào làm không trước ngày sinh. Không áp đặt tuổi tối thiểu hoặc cấm ngày vào làm tương lai vì tài liệu chưa chốt các quy tắc này.

currentSalary nhận số hoặc chuỗi thập phân không âm, tối đa 13 chữ số nguyên và 2 chữ số thập phân. Response trả salary dạng chuỗi (ví dụ `"15000000.00"`) để giữ độ chính xác numeric của PostgreSQL. distanceFromHomeKm trả số hoặc null và được backend tự tính; không nhận giá trị khoảng cách do client tự điền.

API tạo Employee Profile; không tự tạo tài khoản đăng nhập hoặc gửi email. Nếu cần tài khoản EMPLOYEE, ADMIN dùng user_register liên kết employeeId sau đó.

## Danh sách và chi tiết

Ví dụ: `GET /api/employees?q=nguyen&departmentId=1&positionId=1&employmentStatus=ACTIVE&page=1&limit=20`.

Tìm theo mã, tên, email; nhận `search` thay `q`, `department_id` thay `departmentId`, `position_id` thay `positionId` để tương thích client cũ. Không gửi đồng thời cả hai tên cho một giá trị. Query lạ hoặc lặp bị từ chối. Limit tối đa 100.

Danh sách trả id, employeeCode, fullName, email, department, position, employmentStatus. Pagination gồm page, limit, total, hasMore. Chi tiết trả thêm phone, dateOfBirth, gender, address, distanceFromHomeKm, hireDate, employmentType, currentSalary, createdAt, updatedAt và distanceCalculation. Không bọc đối tượng detail/create/update trong `data`; đây là thay đổi so với GET employee cũ chỉ trả raw columns.

## Cập nhật

PATCH chỉ cập nhật trường đã gửi. Không gửi `{}`. Ví dụ:

```json
{
  "phone": "0912345678",
  "address": "197 Trần Phú, Phường Chợ Quán, Hồ Chí Minh",
  "departmentId": 1,
  "positionId": 1,
  "currentSalary": "18000000.00"
}
```

Trường bỏ qua được giữ nguyên. Address null xóa địa chỉ và khoảng cách. Gửi trường address sẽ tính lại khoảng cách, kể cả gửi lại cùng địa chỉ để thử lại; đổi riêng phone/lương không gọi nhà cung cấp bản đồ. Phòng ban/vị trí không gửi lại không bị ép ACTIVE khi sửa trường khác, để vẫn cập nhật được hồ sơ đang tham chiếu danh mục cũ đã ngừng hoạt động.

## Tính và xem trước khoảng cách

HR có thể gọi `POST /api/distance/resolve-address` với `{ "address": "địa chỉ đầy đủ" }` để hiện khoảng cách trước khi lưu form. Có alias `/api/v1/distance/resolve-address`. Frontend nên gọi sau khi HR nhập xong địa chỉ (on blur hoặc debounce), không gọi liên tục mỗi phím. Endpoint chỉ xem trước, không lưu employee. POST/PATCH employee tự tính lại ở server khi cần, không tin số client gửi về.

Địa chỉ được so chính xác sau chuẩn hóa với các biến thể cũ/mới của Vietmap Geocode v4, xác nhận bằng Place v4 rồi tính tuyến ô tô đến tọa độ công ty cố định bằng TomTom. Không tự chọn kết quả đầu tiên. Kiểm tra các biến COMPANY_LATITUDE/COMPANY_LONGITUDE trước khi test.

- READY: có khoảng cách hợp lệ, trả thêm địa chỉ chuẩn hóa và tọa độ trong distanceCalculation.
- REVIEW: không khớp rõ ràng, thiếu thành phần, nhiều ứng viên hoặc nhà cung cấp lỗi; vẫn lưu hồ sơ với distanceFromHomeKm=null và trả reason cụ thể.
- NOT_PROVIDED: chưa có địa chỉ; distanceFromHomeKm=null.

Ví dụ `"Ho Chi Minh City"` trong tài liệu thiết kế chưa đủ để tìm vị trí nhà: hồ sơ được tạo nhưng khoảng cách là null/REVIEW. Khi đổi địa chỉ mà tính thất bại, khoảng cách cũ bị xóa để tránh đưa dữ liệu sai vào model. Không xem null là 0. POST/PATCH trả lý do của lần tính; GET chi tiết chỉ suy ra READY/REVIEW/NOT_PROVIDED từ dữ liệu đã lưu. Chi tiết lý do và tọa độ lần tính được ghi kèm audit khi có thay đổi.

## Lỗi và lưu dữ liệu

- 400 VALIDATION_ERROR: sai trường, ngày, kiểu dữ liệu, lương âm, khoảng cách client tự gửi hoặc body rỗng.
- 400 DEPARTMENT_INACTIVE / POSITION_INACTIVE: không được gán danh mục INACTIVE.
- 401: chưa đăng nhập; 403: không phải HR.
- 404 EMPLOYEE_NOT_FOUND / DEPARTMENT_NOT_FOUND / POSITION_NOT_FOUND.
- 409 EMPLOYEE_CODE_EXISTS / EMPLOYEE_EMAIL_EXISTS.

Tạo/sửa và audit EMPLOYEE_CREATED/EMPLOYEE_UPDATED cùng transaction. FK và trùng mã/email được kiểm tra lại trước commit để tránh race; lỗi audit rollback dữ liệu. Không chạy migration hoặc tạo bảng mới.
