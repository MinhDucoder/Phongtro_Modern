## Quy tắc dự án (Project Rules)

### 1) Ngôn ngữ & giao tiếp
- Luôn trả lời/giao tiếp bằng tiếng Việt.
- Ưu tiên hướng dẫn theo từng bước, xin ý kiến khi cần trước khi hành động tự động.

### 2) Cấu hình lint & format (frontend `phongtro-modern`)
- ESLint: kế thừa `next/core-web-vitals` và `next/typescript` (eslint.config.mjs). Bỏ qua `node_modules`, `.next`, `out`, `build`, `next-env.d.ts`.
- Strict TypeScript: `strict: true`, `noEmit: true`, `skipLibCheck: true`.
- Module: `esnext`, `moduleResolution: bundler`, `jsx: preserve`.
- Paths alias: `@/* -> ./src/*`.

### 3) Next.js
- Phiên bản Next: 15 (scripts dùng Turbopack cho `dev`/`build`).
- `images.remotePatterns`: cho phép `example.com`, `via.placeholder.com`, `images.unsplash.com`, `picsum.photos`, `http://localhost:5000`, `res.cloudinary.com`.
- `transpilePackages`: `leaflet`, `react-leaflet`.

### 4) Package & runtime
- Frontend: React 19, TypeScript 5, ESLint 9, TailwindCSS 4.
- Server: Node ESM (`type: module`), chạy bằng loader `src/config/loader.js`.

### 5) Backend (thư mục `server`)
- Framework: Express.
- Auth: `passport` (local, jwt, facebook, google), `express-session` khi cần.
- DB: MongoDB qua `mongoose`.
- Tìm kiếm: Meilisearch.
- Lưu trữ media: Cloudinary + Multer.
- Lịch: `node-cron`.
- Realtime: `socket.io`.

### 6) Môi trường & bí mật
- Không commit file `.env*` (đã ignore). Cấu hình qua biến môi trường.
- Xem `server/src/config/*.js` để biết thêm biến môi trường cần thiết.

### 7) Quy ước mã nguồn
- Tên biến/hàm rõ nghĩa, tránh viết tắt mơ hồ.
- Ưu tiên early-return, hạn chế khối lồng sâu.
- Không bắt lỗi rồi bỏ qua; chỉ dùng try/catch khi có xử lý ý nghĩa.
- Chỉ viết comment cho phần khó hiểu/logic quan trọng.

### 8) Cấu trúc dự án
- Frontend: Next App Router bên trong `phongtro-modern/src/app`.
- Backend: `server/src` gồm `controllers`, `services`, `models`, `routes`, `middlewares`, `sockets`, `utils`.

### 9) Phát triển & scripts
- Frontend: `npm run dev|build|start|lint` tại thư mục `phongtro-modern`.
- Backend: `npm run dev|start` tại thư mục `server`.

### 10) Quy tắc bổ sung UI
- Viền ô nhập liệu ưu tiên màu xanh dương để đồng bộ giao diện.

### 11) Commit & ignore
- Không commit tệp cấu hình nội bộ tài liệu quy tắc này. Tệp `PROJECT_RULES.md` được ignore ở root, `phongtro-modern`, và `server`.


