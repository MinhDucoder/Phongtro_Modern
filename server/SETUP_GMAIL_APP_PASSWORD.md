# Hướng dẫn thiết lập Gmail App Password cho gửi email

## Mục đích

File này hướng dẫn cách tạo và sử dụng Gmail App Password để gửi email thông qua tài khoản Gmail trong ứng dụng NodeJS. App Password là mật khẩu tạm thời được tạo ra cho các ứng dụng bên thứ ba để truy cập vào tài khoản Google của bạn mà không cần sử dụng mật khẩu chính, giúp tăng cường bảo mật.

## Các bước thiết lập Gmail App Password

1. **Bật xác thực 2 yếu tố (2FA) cho tài khoản Google**
   - Truy cập [Google Account Security](https://myaccount.google.com/security)
   - Tìm mục "2-Step Verification" (Xác thực 2 bước) và bật tính năng này
   - Làm theo hướng dẫn để hoàn tất thiết lập xác thực 2 bước

2. **Tạo App Password**
   - Truy cập [App Passwords](https://myaccount.google.com/apppasswords)
   - Có thể bạn cần xác nhận lại danh tính bằng mật khẩu Google
   - Tại mục "Select app", chọn "Other (Custom name)"
   - Đặt tên, ví dụ: "PhongTroVN Server"
   - Nhấn "Generate"
   - Google sẽ hiển thị một chuỗi gồm 16 ký tự không có khoảng cách (đây là app password)

3. **Sử dụng App Password**
   - Sao chép 16 ký tự được tạo ra
   - Mở file `.env` trong dự án và thay đổi giá trị của `GMAIL_APP_PASSWORD`
   - Giữ nguyên định dạng không có khoảng cách
   - Ví dụ: `GMAIL_APP_PASSWORD=abcdefghijklmnop`

## Lưu ý quan trọng

1. **Bảo mật**: App Password này có quyền truy cập vào tài khoản Gmail của bạn, hãy giữ nó an toàn và không chia sẻ với người khác.

2. **Thời gian sử dụng**: App Password không hết hạn trừ khi bạn xóa nó hoặc thay đổi mật khẩu Google của bạn.

3. **Giới hạn gửi email**: Gmail có giới hạn gửi email, khoảng 500 email/ngày cho tài khoản Gmail thông thường.

4. **Địa chỉ người gửi**: Email sẽ được gửi với địa chỉ email Gmail của bạn làm người gửi.

5. **Trong trường hợp lỗi**: 
   - Kiểm tra lại App Password đã nhập đúng chưa
   - Đảm bảo 2FA đã được kích hoạt
   - Kiểm tra xem có thể có cài đặt bảo mật khác đang chặn việc truy cập
   - Kiểm tra logs để biết thêm chi tiết về lỗi

## Môi trường sản xuất

Trong môi trường sản xuất, bạn nên xem xét sử dụng dịch vụ email chuyên nghiệp như SendGrid, Mailgun, hoặc Amazon SES thay vì Gmail vì những dịch vụ này được thiết kế riêng cho việc gửi email số lượng lớn và có tỷ lệ gửi thành công cao hơn.