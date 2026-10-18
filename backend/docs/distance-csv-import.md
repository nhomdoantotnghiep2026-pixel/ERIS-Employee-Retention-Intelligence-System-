# Chuẩn CSV để tính distanceFromHomeKm

## Thử upload trên trình duyệt

Từ thư mục `backend`, chạy `npm run dev` rồi mở **http://localhost:3000/distance-import-demo**. Trang demo chỉ được phục vụ khi backend không ở chế độ production.

1. Đăng nhập bằng tài khoản ADMIN hoặc HR đang hoạt động (schema mới dùng `role`, tên HR cấu hình bằng `ROLE_HR=HR`).
2. Chọn `backend/examples/employees-distance-sample-50-utf8.csv`. Bản thử nhận CSV UTF-8, chưa nhận file `.xlsx`; với Excel hãy dùng Save As → CSV UTF-8.
3. Xem trước số dòng và lỗi đầu vào. Bước này chưa gọi nhà cung cấp bản đồ.
4. Bấm **Xử lý địa chỉ**. Theo dõi tiến độ và lọc READY/REVIEW.
5. Bấm **Tải kết quả CSV** sau khi hoàn tất. CSV có UTF-8 BOM để Excel đọc đúng dấu tiếng Việt.

Mỗi file tối đa 200 KB / 1000 dòng. Mỗi tài khoản chạy một đợt tại một thời điểm. Các dòng thiếu dữ liệu vẫn được đưa vào kết quả REVIEW để HR sửa, không chặn cả file. Không ghi database: kết quả lưu tạm trong bộ nhớ backend, hết hạn 30 phút sau khi hoàn tất hoặc mất khi restart backend. Tải kết quả trước khi restart. Có thể tải lại trang và đăng nhập để theo dõi tiếp đợt vừa chạy trong cùng tab.

API yêu cầu Bearer token; người dùng chỉ đọc/tải được đợt của mình:

- `POST /api/v1/distance/imports/preview` với JSON `{ "csv": "nội dung file CSV" }`: xem trước và kiểm tra cột.
- `POST /api/v1/distance/imports` với JSON tương tự: trả HTTP 202 và `id` để theo dõi.
- `GET /api/v1/distance/imports/:id`: tiến độ, số READY/REVIEW và các dòng đã xử lý.
- `GET /api/v1/distance/imports/:id/download`: CSV kết quả khi hoàn tất.

## Cấu trúc dữ liệu

File UTF-8 có dòng tiêu đề và các cột bắt buộc:

```csv
employeeId,houseNumber,street,ward,district,city
E001,197,Trần Phú,Phường 4,Quận 5,Hồ Chí Minh
```

- `employeeId`: mã duy nhất trong file; không dùng tên hoặc email làm mã.
- `houseNumber`: số nhà đầy đủ, kể cả phần sau dấu `/` hoặc chữ cái (ví dụ `71/26A`).
- `street`: tên đường/hẻm chính xác. Không gộp số nhà vào cột này.
- `ward`: phường/xã theo **địa chỉ nhân viên đang có**, dù là tên cũ hay mới; bắt buộc để tự duyệt.
- `district`: quận/huyện theo địa chỉ cũ; có thể để trống với địa chỉ mới không còn cấp quận/huyện. Không tự đoán phường mới từ quận cũ.
- `city`: tỉnh/thành phố đầy đủ, ví dụ `Hồ Chí Minh`; bắt buộc. Không tự thêm thành phố mặc định.

Các cột khác trong file hiện chưa được hỗ trợ. Nếu địa chỉ có dấu phẩy trong một ô, đặt ô trong dấu ngoặc kép theo chuẩn CSV. Giới hạn 1000 người/file.

Chạy từ thư mục `backend` (cần cấu hình Vietmap, TomTom và tọa độ công ty trong `.env`):

```powershell
node --env-file=.env scripts/import-distance-csv.js .\employees.csv .\employees-distance.csv
```

Chương trình không sửa database hay file đầu vào. File đầu ra phải chưa tồn tại. Mỗi dòng có `status`:

- `READY`: số nhà, đường, phường/xã, tỉnh/thành và quận/huyện nếu có khớp **duy nhất** với một biến thể địa chỉ cũ hoặc mới do Vietmap Geocode v4 trả về (`display_type=5`); Place v4 xác nhận lại đúng biến thể đó và trả tọa độ; TomTom trả quãng đường ô tô. Dùng `distanceFromHomeKm` của dòng này cho model.
- `REVIEW`: thiếu/không khớp địa chỉ, có nhiều ứng viên phù hợp, Place trả địa chỉ khác, hoặc dịch vụ lỗi. Xem cột `reason`; **không đưa dòng này vào model như thể khoảng cách bằng 0**.

Kết quả còn lưu `normalizedAddress`, `refId`, `latitude`, `longitude` để HR xem lại ngoại lệ. Các địa chỉ trùng nhau trong cùng file chỉ gọi nhà cung cấp một lần. Xử lý tuần tự nhằm giảm nguy cơ chạm giới hạn tốc độ; 200 dòng có thể mất vài phút. Công cụ dòng lệnh và trang demo dùng chung quy tắc xử lý. Trước khi chạy, kiểm tra `COMPANY_LATITUDE` và `COMPANY_LONGITUDE` là tọa độ công ty thực sự muốn dùng cho model.

Quy tắc tự duyệt cố ý chặt: cách viết tắt tỉnh/thành, hẻm không có số nhà, địa chỉ cũ/mới không khớp biến thể Vietmap trả về, hoặc dữ liệu Vietmap thiếu `hs_num` sẽ vào `REVIEW`. Giữ nguyên địa chỉ gốc trong CSV để truy vết; không thay tên phường cũ bằng tên mới theo bảng quy đổi tự chế. Sau khi có một tập CSV thực tế đã được HR xác minh, mới nên nới quy tắc theo tỷ lệ sai đo được.
