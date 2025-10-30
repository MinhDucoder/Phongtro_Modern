# 🧠 Recommendation System (RS) – Node.js + Python + MongoDB

Hệ thống gợi ý phòng trọ (hoặc bài đăng) dựa trên nội dung (`content-based filtering`)  
Triển khai backend Node.js giao tiếp với Python (scikit-learn, pandas) để tính độ tương đồng.

---

## 🚀 1. Tổng quan

Mục tiêu của hệ thống:
- Gợi ý các bài đăng tương tự nhau dựa trên **nội dung và thuộc tính phòng** (giá, diện tích, vị trí, tiện ích, mô tả...).
- Dễ dàng tích hợp vào backend hiện có (Node.js + MongoDB).
- Hỗ trợ cập nhật và huấn luyện lại dữ liệu gợi ý theo định kỳ (cron job hoặc khi có bài mới).

---

## 🧩 2. Kiến trúc hệ thống

+-----------------+         +---------------------+
|    MongoDB      |  <-->   |   Node.js Backend   |
| (Post, Room...) |        |  Express + Mongoose |
+-----------------+         +---------------------+
         |                         |
         |  HTTP (fetch posts)     |
         v                         |
    +---------------------+        |
    | Python Engine (RS)  | <------+
    | pandas + sklearn    |
    +---------------------+

## ⚙️ 3. Cài đặt & chạy

```bash
# Tạo venv
python -m venv env

# Kích hoạt venv
# macOS/Linux
source env/bin/activate
# Windows PowerShell
./env/Scripts/Activate.ps1

# Cài dependencies
cd RS/RS_Posts
pip install -r requirements.txt

# Khởi tạo model (gọi API Node để lấy posts và build vector)
python initModel.py

# Chạy service Flask (port 5001)
python main.py
```

Yêu cầu: Backend Node.js phải đang chạy và cung cấp endpoint `GET /api/v1/posts` trả về `{ data: { items: [...] } }`.

## 🔌 4. API cho FE tích hợp

- Endpoint: `GET http://localhost:5001/recommendPosts?postId=<id>&topK=5`
- Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f...",
      "room": {
        "title": "...",
        "price": 3500000,
        "area": 25,
        "address": "...",
        "images": ["..."]
      }
    }
  ],
  "meta": { "topK": 5 }
}
```

- Healthcheck: `GET http://localhost:5001/health` -> `{ "status": "ok" }`

Ghi chú:
- `topK` mặc định 5, tối đa 20.
- Nếu `postId` không tồn tại: trả `404` với `{ success: false, error: "Post not found" }`.
