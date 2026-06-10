# landingPage-be

API quản lý dữ liệu form tư vấn nội thất cho Landing Page. Viết bằng Express và lưu data trên **TiDB (MySQL interface)**.

## Tính năng chính

- `GET /api/options` – lấy các nhóm lựa chọn trên form UI
- `GET /api/options/:slug` – lấy lựa chọn cho từng nhóm như `rooms`, `styles`, `materials`
- `PUT /api/options/:slug` – cập nhật tên/mô tả field
- `PUT /api/options/:slug/items` – cập nhật danh sách lựa chọn con của field
- `POST /api/options/:slug/upload-image` – upload ảnh lựa chọn từ máy lên Cloudinary, trả về URL để lưu vào `chi_tiet_lua_chon.hinh_anh`
- `GET /api/content` và `GET /api/images` – giữ route tương thích, trả danh sách rỗng vì 2 bảng cũ đã bỏ
- `GET /api/health` – endpoint healthcheck cho Railway

## Schema 9 bảng

Database hiện chỉ còn 9 bảng: 8 bảng chính đúng theo 8 mục UI và 1 bảng chi tiết lựa chọn chung.

| Mục UI | Bảng |
| --- | --- |
| Hồ sơ người sử dụng | `ho_so_nguoi_su_dung` |
| Mục tiêu & mong muốn của khách hàng | `muc_tieu_mong_muon_cua_khach_hang` |
| Chọn phòng muốn thiết kế | `chon_phong_muon_thiet_ke` |
| Phong cách & cảm hứng thiết kế | `phong_cach_cam_hung_thiet_ke` |
| Colour combo | `colour_combo` |
| Material | `material` |
| Khảo sát thêm | `khao_sat_them` |
| Thông tin tổng quan dự án | `thong_tin_tong_quan_du_an` |
| Chi tiết lựa chọn con | `chi_tiet_lua_chon` |

8 bảng chính lưu field/câu hỏi với các cột như `ten_truong`, `ma_truong`, `kieu_nhap`, `bat_buoc`, `placeholder`, `thu_tu`, `trang_thai`. Bảng `chi_tiet_lua_chon` lưu các lựa chọn con của checkbox/radio/select/card bằng `bang_cha` và `field_id`.

API vẫn giữ format cũ theo slug để frontend/admin chưa phải đổi. Ví dụ `rooms` là field trong bảng `chon_phong_muon_thiet_ke`, còn các lựa chọn như `Phòng khách`, `Phòng ngủ master` nằm trong `chi_tiet_lua_chon`.

## Cấu trúc
```
landingPage-be/
├── src/
│   ├── db/              # Khởi tạo pool TiDB + seed data
│   ├── routes/          # Options, content compatibility, images compatibility, health
│   ├── validators/      # Zod schemas
│   ├── utils/           # Cloudinary helper
│   ├── middleware/      # Error handler
│   └── server.js
├── data/                # (optional) thư mục trống nếu muốn mount volume tạm thời
├── package.json
├── .env.example
└── README.md
```

## Chạy local
```bash
cd landingPage-be
cp .env.example .env   # nhập thông tin TiDB
npm install
npm run dev
```
Server mặc định nghe ở `http://localhost:8080`.

### Cách lấy thông tin TiDB và Cloudinary

1. **TiDB Cloud (MySQL endpoint)**
   - Tạo cluster trong [TiDB Cloud](https://tidbcloud.com) → tab *Connect* → chọn *Public Endpoint (MySQL)*.
   - Ghi lại các giá trị:
     - `DB_HOST` (ví dụ `gateway01.ap-northeast-1.prod.aws.tidbcloud.com`)
     - `DB_PORT` (thường 4000)
     - `DB_USER` (dạng `root` hoặc `xxx.root` tuỳ cluster)
     - `DB_PASSWORD` (bạn tạo khi enable password)
     - `DB_NAME` (khuyên dùng `landingpage`; tạo database này trước hoặc dùng tên riêng nhưng cập nhật cùng seed script)
   - Nếu dùng public endpoint, đặt `DB_SSL=true` trong `.env` để driver bật TLS.

Sau khi điền đầy đủ các biến ở `.env`, chạy `npm run dev` hoặc deploy lên Railway (set các biến trong bảng Environment của service).

2. **Cloudinary**
   - Cần cho endpoint upload ảnh option từ admin.
   - Khai báo:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `CLOUDINARY_FOLDER` nếu muốn đổi folder mặc định.

## Triển khai lên Railway
1. Tạo project mới → chọn **Node.js**.
2. Kết nối repo, trỏ folder triển khai tới `landingPage-be` (Settings → Service → Deploy directory).
3. Khai báo biến môi trường:
   - `PORT` (Railway tự gán)
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://domain-landing-page.com`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `DB_POOL_SIZE=5` (copy từ TiDB Cloud console)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`
4. Không cần persistent storage vì dữ liệu nằm trên TiDB Cloud.
5. Deploy (Railway sẽ chạy `npm install` + `npm start`).

## Gợi ý tích hợp UI
- Lấy danh sách nhóm field: `GET /api/options`.
- Lấy lựa chọn của một field: `GET /api/options/:slug`.
- Lưu danh sách lựa chọn: `PUT /api/options/:slug/items`.

## Bảo mật
- CORS cho phép nhiều domain qua biến môi trường.
- Helmet + rate-limit (có thể bổ sung nhanh bằng `express-rate-limit` nếu cần).
- Với môi trường production, khuyến khích thêm lớp auth đơn giản (Bearer token) trước khi expose endpoints edit cho client.
# landing-page-be
