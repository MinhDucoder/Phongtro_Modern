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

+-----------------+ +---------------------+
| MongoDB | <--> | Node.js Backend |
| (Post, Room...)| | Express + Mongoose |
+-----------------+ +---------------------+
|
| REST API (recommend/:postId)
v
+---------------------+
| Python Engine (RS) |
| pandas + sklearn |
+---------------------+
bash
python3 -m venv env
source env/bin/activate        # macOS / Linux
pip install pandas numpy scikit-learn flask
cd RS_Posts

# env\Scripts\activate         # Windows (PowerShell: .\env\Scripts\Activate.ps1)

pip install -r requirements.txt
python3 init.py
python3 main.py
