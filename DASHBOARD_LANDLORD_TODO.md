# Dashboard Landlord – Checklist Hoàn Thiện

## Tình trạng tổng quan
- Các hệ thống toast đã thống nhất dùng `toastManager`, một `CustomToaster` duy nhất.
- Những module chính (tin đăng, tin đã lưu, analytics, thanh toán, yêu cầu thuê) đang hiển thị dữ liệu demo và vẫn hoạt động ở mức giao diện.

## Hạng mục cần hoàn thiện

### 1. Dữ liệu thật / API
- `UserProfile`, `UserAccount`, `UserSettings`: vẫn dùng mock data, chưa kết nối API user/profile/notification thực. Cần:
  - Lấy thông tin profile, avatar, thông báo, bảo mật từ API backend.
  - Ghi lại các chỉnh sửa (profile, mật khẩu, notification) qua endpoint thật.
- `MyPostings`, `Analytics`: hiện lấy demo data; cần kết nối `dashboardService` cho thống kê, top posts, device stats.
- `SavedProperties`: API mới chỉ giả lập; cần dùng endpoint `saved-properties` thực, phân trang, xóa khỏi danh sách sau khi xác nhận.

### 2. Toast & UX nhất quán
- Một số component dashboard vẫn import `react-hot-toast` (UserProfile, UserAccount, PostForm, UserSettings). Cần chuyển sang `toastManager` để đồng nhất giao diện.
- Kiểm tra các view khác (thanh toán, lịch hẹn, yêu cầu thuê) xem có toast thô; chuyển đổi tương tự.

### 3. Upload & xử lý file
- `UserProfile` upload avatar hiện chỉ tạo URL tạm (`URL.createObjectURL`). Cần tích hợp upload lên server (cloudinary/s3) và lưu đường dẫn thực.
- Xử lý lỗi kích thước/định dạng file và hiển thị tiến trình.

### 4. Form validation
- Củng cố validation khi đổi mật khẩu: yêu cầu độ dài, ký tự đặc biệt, thông báo thân thiện.
- `PostForm` và `SavedProperties` vẫn hiển thị placeholder dữ liệu mẫu. Cần thay placeholder bằng help text hoặc fetch options từ API (vd. danh sách quận/huyện, loại phòng).

### 5. Nội dung hiển thị
- Thay thế hình ảnh default (`/placeholder-room.svg`) bằng ảnh thực hoặc skeleton loading.
- Bổ sung thời gian thực cho các thống kê (chart views, device stats) và trạng thái tin (đang hiển thị, chờ duyệt).

### 6. Kiểm thử chức năng
- Sau khi hoàn thiện API, kiểm tra:
  - CRUD tin đăng: tạo, sửa, xóa, gia hạn, đổi trạng thái.
  - Gửi yêu cầu thuê, lưu tin, thanh toán, thống kê analytics.
  - Toast hiển thị đúng, tự đóng, không chồng nhau.

## Ghi chú
- Khi hoàn thành từng hạng mục, cập nhật README này hoặc chuyển vào hệ thống ticket để theo dõi.
- Checklist ưu tiên: 1) Kết nối API thật cho user/profile & analytics; 2) Chuẩn hóa toast cho các module còn lại; 3) Upload avatar thực; 4) Validation forms.
