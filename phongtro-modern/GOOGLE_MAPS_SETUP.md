# 🗺️ Google Maps API Setup Guide

## Lỗi hiện tại
```
Google Maps JavaScript API error: ApiProjectMapError
```

## Nguyên nhân
- Thiếu Google Maps API Key
- API Key chưa được cấu hình đúng
- Chưa enable các APIs cần thiết

## Giải pháp

### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable các APIs sau:
   - **Maps JavaScript API**
   - **Places API** 
   - **Geocoding API**
   - **Street View Static API**

### Bước 2: Tạo API Key
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy API key được tạo

### Bước 3: Cấu hình Environment Variables
1. Tạo file `.env.local` trong thư mục `phongtro-modern/`
2. Thêm nội dung sau:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Other environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Bước 4: Restrict API Key (Khuyến nghị cho production)
1. Click vào API key vừa tạo
2. **Application restrictions**: HTTP referrers
   - Thêm: `localhost:3000/*`
   - Thêm: `your-domain.com/*`
3. **API restrictions**: Chọn các APIs đã enable

### Bước 5: Restart Server
```bash
# Dừng server hiện tại (Ctrl+C)
# Chạy lại
npm run dev
# hoặc
yarn dev
```

## Kiểm tra
- Mở trang có map (ví dụ: chi tiết phòng trọ)
- Nếu vẫn lỗi, kiểm tra console để xem thông báo cụ thể
- Đảm bảo API key đúng và các APIs đã được enable

## Troubleshooting

### Lỗi "RefererNotAllowedMapError"
- Thêm domain vào HTTP referrers trong API key settings

### Lỗi "QuotaExceededError" 
- Kiểm tra quota trong Google Cloud Console
- Có thể cần upgrade billing account

### Lỗi "ApiNotActivatedMapError"
- Enable Maps JavaScript API trong Google Cloud Console

## Chi phí
- Google Maps có free tier: $200/tháng
- Đủ cho hầu hết ứng dụng nhỏ
- Xem chi tiết: [Google Maps Pricing](https://developers.google.com/maps/billing-and-pricing)








