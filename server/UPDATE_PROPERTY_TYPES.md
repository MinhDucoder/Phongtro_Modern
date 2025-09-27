# Hướng dẫn cập nhật Property Types

## Mục đích
Thêm trường `propertyType` và `roomType` vào cơ sở dữ liệu để phân loại bất động sản.

## Các thay đổi đã thực hiện

### 1. Cập nhật Schema

#### Room Schema (`server/src/models/roomSchema.js`)
- Thêm trường `propertyType` với các giá trị:
  - `phong_tro` (Phòng trọ)
  - `can_ho` (Căn hộ)
  - `nha_nguyen_can` (Nhà nguyên căn)
  - `chung_cu` (Chung cư)
  - `nha_tro` (Nhà trọ)

- Thêm trường `roomType` với các giá trị:
  - `phong_don`, `phong_doi`, `phong_ba`, `phong_tu` (cho phòng trọ)
  - `can_ho_1_phong`, `can_ho_2_phong`, `can_ho_3_phong` (cho căn hộ)
  - `nha_1_tang`, `nha_2_tang`, `nha_3_tang` (cho nhà nguyên căn)

#### Post Schema (`server/src/models/postSchema.js`)
- Thêm trường `propertyType` và `roomType` tương tự Room Schema

### 2. Script cập nhật dữ liệu

#### Chạy script cập nhật:
```bash
cd server
npm run update-property-types
```

#### Script sẽ thực hiện:
1. Cập nhật tất cả rooms/posts chưa có propertyType với giá trị mặc định `phong_tro`
2. Phân loại tự động dựa trên title và description
3. Tạo dữ liệu mẫu với các loại bất động sản khác nhau

### 3. Dữ liệu mẫu được tạo

Script sẽ tạo 3 rooms mẫu:
- **Phòng trọ**: 2,000,000 VND, 25m²
- **Căn hộ**: 15,000,000 VND, 80m²  
- **Nhà nguyên căn**: 25,000,000 VND, 150m²

## Cách sử dụng

### 1. Cài đặt dependencies
```bash
cd server
npm install
```

### 2. Cấu hình database
Tạo file `.env` với nội dung:
```
MONGODB_URI=mongodb://localhost:27017/phongtro_modern
```

### 3. Chạy script cập nhật
```bash
npm run update-property-types
```

### 4. Khởi động server
```bash
npm start
```

## Kết quả mong đợi

Sau khi chạy script:
- Tất cả rooms và posts sẽ có trường `propertyType`
- Dữ liệu mẫu sẽ được tạo với các loại bất động sản khác nhau
- Frontend sẽ hiển thị đúng loại bất động sản với badge màu sắc

## Lưu ý

- Script sẽ không ghi đè dữ liệu hiện có
- Chỉ cập nhật các records chưa có propertyType
- Dữ liệu mẫu chỉ được tạo nếu chưa có dữ liệu
