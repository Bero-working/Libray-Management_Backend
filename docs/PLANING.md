# PLANING

## Mục tiêu dự án

Xây dựng backend cho hệ thống quản lý thư viện với các quyết định đã chốt:

- Framework: **NestJS**
- ORM / migration: **Prisma**
- Database: **Supabase Postgres**
- API base path: **`/api/v1`**
- Delete policy: **soft delete**
- Auth model: **access token + refresh token**
- In thẻ thư viện: **xuất PDF**

## Nguyên tắc xuyên suốt

- Mặc định mọi truy vấn nghiệp vụ phải loại record đã soft delete (`deleted_at IS NULL`)
- Dùng `DATABASE_URL` cho runtime và `DIRECT_URL` cho migration / thao tác schema
- Không trả raw Prisma entity có `BigInt` trực tiếp ra JSON nếu chưa có lớp serialize/DTO phù hợp
- Các endpoint trả file/stream phải bypass success envelope JSON
- Các thao tác mượn / trả phải đi trong transaction Prisma
- Mọi phase phải pass tối thiểu:
  - `npm run lint`
  - `npm test -- --runInBand`
  - `npm run build`

## Trạng thái tổng quan

| Phase | Tên phase | Trạng thái |
|---|---|---|
| Phase 0 | Chốt kiến trúc và quy ước | Done |
| Phase 1 | Platform + Prisma + DB foundation | Done |
| Phase 2 | Auth + RBAC + refresh token + staff/accounts | Done |
| Phase 3 | Readers + Catalog + print-card PDF | Done |
| Phase 4 | Loans transaction core | Done |
| Phase 5 | Search + Reports + QA | In progress |

---

## Phase 0 — Chốt kiến trúc và quy ước

### Task
- [x] Phân tích `docs/SRS.md`
- [x] Phân tích `docs/DATABASE_SCHEMA.md`
- [x] Phân tích `docs/API_REFERENCE.md`
- [x] Chốt stack: NestJS + Prisma + Supabase Postgres
- [x] Chốt delete policy: soft delete
- [x] Chốt auth model: access token + refresh token
- [x] Chốt print-card: PDF
- [x] Chốt hướng chia phase triển khai

### Kết quả
- Có kế hoạch phase-by-phase rõ ràng
- Có sprint/phase breakdown để triển khai tuần tự

---

## Phase 1 — Platform + Prisma + DB foundation

### Task
- [x] Thêm `ConfigModule` global
- [x] Thêm env validation
- [x] Thiết lập `/api/v1` + global `ValidationPipe`
- [x] Chuẩn hóa success response interceptor
- [x] Chuẩn hóa global exception filter
- [x] Bật shutdown hooks
- [x] Tạo `PrismaModule` và `PrismaService`
- [x] Cấu hình Prisma 7 bằng `prisma.config.ts`
- [x] Tạo `prisma/schema.prisma`
- [x] Tạo baseline migration cho 7 thực thể chính
- [x] Thêm `.env.example`
- [x] Cập nhật `.gitignore` cho `.env*`
- [x] Đổi starter endpoint thành health endpoint
- [x] Viết unit test cho foundation layer
- [x] Viết e2e test cho `/api/v1/health`
- [x] Apply migration lên Supabase

### Kết quả
- App foundation chạy được
- Prisma schema + migration baseline đã có
- DB Supabase đã được tạo theo migration hiện tại
- Build / lint / unit / e2e đều pass

### API đã tạo trong Phase 1

#### `GET /api/v1/health`
**Mục đích:** kiểm tra app hoạt động.

**Request body:** không có.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "service": "backend",
    "status": "ok",
    "timestamp": "2026-03-19T00:00:00.000Z"
  }
}
```

**Điều kiện:** public, không cần token.

---

## Phase 2 — Auth + RBAC + refresh token + staff/accounts

### Mục tiêu
Xây nền bảo mật và nhóm API quản trị để các phase sau có thể dùng RBAC đúng chuẩn.

### Task
- [x] Chọn và tích hợp thư viện hash mật khẩu (`bcryptjs`)
- [x] Tạo `auth` module
- [x] Tạo DTO cho `login`, `refresh`, `logout`
- [x] Tạo service phát hành access token
- [x] Tạo service phát hành refresh token
- [x] Lưu refresh token dưới dạng hash trong `staff_accounts.refresh_token_hash`
- [x] Tạo endpoint `POST /auth/login`
- [x] Tạo endpoint `POST /auth/refresh`
- [x] Tạo endpoint `POST /auth/logout`
- [x] Kiểm tra trạng thái tài khoản trước khi đăng nhập / refresh / logout
- [x] Tạo JWT guard
- [x] Tạo roles decorator và roles guard
- [x] Tạo `staff` module
- [x] Tạo `accounts` module
- [x] Thực hiện CRUD cho `staff`
- [x] Thực hiện CRUD cho `staff_accounts`
- [x] Đảm bảo query mặc định bỏ qua record soft delete
- [x] Chuẩn hóa DTO/serializer để tránh lỗi `BigInt` khi trả JSON
- [x] Thêm throttling cho auth endpoints
- [x] Map Prisma unique conflict sang `409 Conflict`
- [x] Viết unit test cho auth service và guards
- [x] Viết integration/e2e test nền cho login validation / auth guard / role restriction
- [ ] Xử lý hoặc nâng cấp package còn vulnerability mức cao trong Prisma toolchain

### Kết quả
- Login / refresh / logout hoạt động theo flow hiện tại
- JWT guard + roles guard đã được wiring toàn cục
- `ADMIN` quản lý được `staff` và `accounts`
- BigInt được serialize an toàn trước khi trả JSON
- Build / lint / unit / e2e đều pass
- Review cuối: **GO cho Phase 3** trong phạm vi code đã triển khai

### API đã tạo trong Phase 2

#### Auth API

- `POST /api/v1/auth/login`
  - **Quyền:** Public
  - **FR/BR:** FR-01, BR-01
  - **Request chính:** `username`, `password`
  - **Kết quả:** trả `accessToken`, `refreshToken`, và thông tin user hiện tại.
- `POST /api/v1/auth/refresh`
  - **Quyền:** Public
  - **FR/BR:** FR-01, BR-01
  - **Request chính:** `refreshToken`
  - **Kết quả:** cấp lại cặp token mới.
- `POST /api/v1/auth/logout`
  - **Quyền:** Public
  - **FR/BR:** FR-01, BR-01
  - **Request chính:** `refreshToken`
  - **Kết quả:** xóa refresh token hash hiện tại và trả message đăng xuất thành công.

#### Staff API

- `GET /api/v1/staff`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-22
- `GET /api/v1/staff/{ma_nhan_vien}`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-22
- `POST /api/v1/staff`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-22, BR-02
  - **Request chính:** `code`, `fullName`, `contactInfo`, `status`
- `PATCH /api/v1/staff/{ma_nhan_vien}`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-22
  - **Request chính:** optional `fullName`, optional `contactInfo`, optional `status`
- `DELETE /api/v1/staff/{ma_nhan_vien}`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-22
  - **Mô tả:** soft delete nhân viên.

#### Accounts API

- `GET /api/v1/accounts`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-23, FR-24
- `GET /api/v1/accounts/{username}`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-23, FR-24
- `POST /api/v1/accounts`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-23, FR-24, BR-02
  - **Request chính:** `username`, `password`, `role`, `staffCode`, `status`
- `PATCH /api/v1/accounts/{username}`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-24
  - **Request chính:** optional `role`, optional `status`, optional `newPassword`
- `DELETE /api/v1/accounts/{username}`
  - **Quyền:** `ADMIN`
  - **FR/BR:** FR-23, FR-24
  - **Mô tả:** soft delete tài khoản và xóa `refreshTokenHash`.

---

## Phase 3 — Readers + Catalog + print-card PDF

### Mục tiêu
Xây các module nghiệp vụ nền tảng của thư viện: độc giả và danh mục sách.

### Task
- [x] Tạo `readers` module
- [x] Tạo `majors` module
- [x] Tạo `titles` module
- [x] Tạo `copies` module
- [x] Thực hiện `GET /readers`
- [x] Thực hiện `GET /readers/{ma_doc_gia}`
- [x] Thực hiện `POST /readers`
- [x] Thực hiện `PATCH /readers/{ma_doc_gia}`
- [x] Thực hiện soft delete cho `DELETE /readers/{ma_doc_gia}` (enforce BR-09)
- [x] Thực hiện `GET/POST/PATCH/DELETE` cho `majors` (chặn xóa khi còn `DAU_SACH` tham chiếu)
- [x] Thực hiện `GET/POST/PATCH/DELETE` cho `titles` (enforce BR-07)
- [x] Thực hiện `GET/POST/PATCH/DELETE` cho `copies` (enforce BR-08)
- [x] Thêm computed field `so_luong_sach` cho title response dựa trên số bản sao (`BAN_SAO_SACH`) còn chưa soft delete
- [x] Áp dụng ràng buộc soft delete trong toàn bộ query danh mục (`readers`, `majors`, `titles`, `copies`)
- [x] Thiết kế payload in thẻ thư viện (dùng thông tin `ma_doc_gia`, `ho_ten`, `lop`, trạng thái thẻ)
- [x] Chọn thư viện render PDF (`pdfkit`)
- [x] Thực hiện `POST /readers/{ma_doc_gia}/print-card` trả `application/pdf`
- [x] Đảm bảo success interceptor không wrap response PDF (trả `StreamableFile`)
- [x] Viết unit test bổ sung để cover các module Phase 3 (business rules cơ bản)
- [x] Viết e2e test cơ bản cho readers/catalog (ít nhất cover RBAC: reject khi thiếu bearer token)

### API đã tạo trong Phase 3

#### Readers API

- `GET /api/v1/readers`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-03, FR-05, FR-06
  - **Mô tả:** danh sách độc giả.
  - **Query theo API reference:** `q`, `lop`, `trang_thai`, `page`, `page_size`.
- `GET /api/v1/readers/{ma_doc_gia}`
  - **Quyền:** `LIBRARIAN`
  - **Mô tả:** chi tiết độc giả theo mã, bỏ qua record đã soft delete.
- `POST /api/v1/readers`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-03, BR-02
  - **Request chính:** `ma_doc_gia`, `ho_ten`, `lop`, `ngay_sinh`, `gioi_tinh`, `trang_thai`.
- `PATCH /api/v1/readers/{ma_doc_gia}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-05
  - **Mô tả:** cập nhật thông tin độc giả.
- `DELETE /api/v1/readers/{ma_doc_gia}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-06, BR-09
  - **Mô tả:** soft delete độc giả; trả `409 BR_09_READER_HAS_UNRETURNED_LOAN` nếu độc giả đang có phiếu mượn chưa trả.
- `POST /api/v1/readers/{ma_doc_gia}/print-card`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-04
  - **Mô tả:** sinh file PDF in thẻ thư viện cho độc giả.
  - **Response:** `200 application/pdf`, bypass JSON envelope.

#### Majors API

- `GET /api/v1/majors`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-07
  - **Mô tả:** danh sách chuyên ngành chưa soft delete.
- `GET /api/v1/majors/{ma_chuyen_nganh}`
  - **Quyền:** `LIBRARIAN`
  - **Mô tả:** chi tiết chuyên ngành theo mã.
- `POST /api/v1/majors`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-07, BR-02
  - **Request chính:** `ma_chuyen_nganh`, `ten_chuyen_nganh`, optional `mo_ta`.
- `PATCH /api/v1/majors/{ma_chuyen_nganh}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-07
  - **Mô tả:** cập nhật tên/mô tả chuyên ngành.
- `DELETE /api/v1/majors/{ma_chuyen_nganh}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-07
  - **Mô tả:** soft delete chuyên ngành, không cho xóa nếu còn `DAU_SACH` tham chiếu.

#### Titles API

- `GET /api/v1/titles`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-08, FR-09, FR-10
  - **Mô tả:** danh sách đầu sách, trả kèm `so_luong_sach` computed từ số bản sao chưa soft delete.
- `GET /api/v1/titles/{ma_dau_sach}`
  - **Quyền:** `LIBRARIAN`
  - **Mô tả:** chi tiết đầu sách + `so_luong_sach`.
- `POST /api/v1/titles`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-08, BR-02
  - **Request chính:** `ma_dau_sach`, `ten_dau_sach`, `nha_xuat_ban`, `so_trang`, `kich_thuoc`, `tac_gia`, `ma_chuyen_nganh`.
  - **Mô tả:** tạo đầu sách mới, validate chuyên ngành tồn tại và enforce unique code.
- `PATCH /api/v1/titles/{ma_dau_sach}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-09
  - **Mô tả:** cập nhật metadata và/hoặc chuyên ngành.
- `DELETE /api/v1/titles/{ma_dau_sach}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-10, BR-07
  - **Mô tả:** soft delete đầu sách, không cho xóa nếu còn bản sao hoặc loan chưa xử lý.

#### Copies API

- `GET /api/v1/copies`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-11, BR-03
  - **Mô tả:** danh sách bản sao.
  - **Query theo API reference:** `q`, `ma_dau_sach`, `tinh_trang`, `page`, `limit`.
- `GET /api/v1/copies/{ma_sach}`
  - **Quyền:** `LIBRARIAN`
  - **Mô tả:** chi tiết bản sao theo mã.
- `POST /api/v1/copies`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-11, BR-02, BR-03
  - **Request chính:** `ma_sach`, `ma_dau_sach`, `tinh_trang`, `ngay_nhap`.
- `PATCH /api/v1/copies/{ma_sach}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-12
  - **Mô tả:** cập nhật `tinh_trang` và/hoặc `ngay_nhap` bản sao.
- `DELETE /api/v1/copies/{ma_sach}`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-13, BR-08
  - **Mô tả:** soft delete bản sao, không cho xóa nếu bản sao đang mượn hoặc còn gắn với phiếu mượn chưa hoàn tất.

### Kết quả
- Librarian quản lý được độc giả, chuyên ngành, đầu sách, bản sao sách qua các endpoint `/readers`, `/majors`, `/titles`, `/copies`.
- Readers/Copies đã được mô tả lại theo cùng terminology với `docs/API_REFERENCE.md`.
- `so_luong_sach` cho đầu sách được tính động từ số bản sao chưa soft delete.
- API in thẻ thư viện hoạt động và trả PDF thật, không bị JSON envelope bọc ngoài.
- `npm run lint`, `npm test -- --runInBand`, `npm run build` đều pass sau khi thêm các module Phase 3.

---

## Phase 4 — Loans transaction core

### Mục tiêu
Xây module `loans` để xử lý luồng mượn/trả sách theo BR-04/BR-05/BR-06/BR-10/BR-11, chạy trong transaction Prisma và thống nhất với API docs.

### Task
- [x] Tạo `loans` module (`LoansModule`, `LoansService`, `LoansController`).
- [x] Tạo DTO cho `create-loan`, `return-loan`, filter/pagination.
- [x] Thực hiện `GET /loans`, `GET /loans/{id}` (list + detail, filter theo status/reader/copy, soft delete).
- [x] Thực hiện `POST /loans` (mượn sách, enforce BR-04/BR-05/BR-06/BR-10).
- [x] Thực hiện `PATCH /loans/{id}/return` (trả sách, enforce BR-11).
- [x] Đảm bảo transaction Prisma cho mượn/trả (update `Loan` + `BookCopy` trong cùng transaction).
- [x] Map lỗi nghiệp vụ sang `409 Conflict` với mã lỗi business (`BR_04_*`, `BR_06_*`, `BR_11_*`) và expose qua HttpExceptionFilter.
- [x] Viết unit test cho `LoansService` (happy path + BR-04/BR-06/BR-11 cơ bản).
- [x] Viết e2e test cơ bản cho loans (RBAC: reject khi thiếu bearer token cho `/api/v1/loans`).
- [x] Cập nhật `HttpExceptionFilter` để nếu response có `code` thì dùng `error.code` đó thay vì code mặc định theo status.

### API đã tạo trong Phase 4

#### Loans API

- `GET /api/v1/loans`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-15, FR-16, FR-18
  - **Mô tả:** danh sách phiếu mượn, hỗ trợ filter theo `ma_doc_gia`, `ma_sach`, `status`, `ngay_muon_from`, `ngay_muon_to`, `page`, `limit`.
  - **Response shape:** danh sách nằm trong `data.items`, metadata phân trang nằm trong `data.meta` với các field `page`, `limit`, `total`, `totalPages`.
- `GET /api/v1/loans/{id}`
  - **Quyền:** `LIBRARIAN`
  - **Mô tả:** chi tiết phiếu mượn theo `id`.
- `POST /api/v1/loans`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-15, FR-16, FR-17, BR-04, BR-05, BR-06, BR-10
  - **Request chính:** `ma_doc_gia`, `ma_sach`, optional `ngay_muon`, optional `ghi_chu_tinh_trang`.
  - **Mô tả:** lập phiếu mượn mới; `ma_thu_thu` được suy ra từ access token của người đang thao tác.
  - **Ràng buộc:** mỗi độc giả chỉ có tối đa 1 phiếu mượn chưa trả; chỉ bản sao `AVAILABLE` mới được mượn; khi tạo phiếu mượn thành công, bản sao chuyển sang `BORROWED` trong cùng transaction.
- `PATCH /api/v1/loans/{id}/return`
  - **Quyền:** `LIBRARIAN`
  - **FR/BR:** FR-18, FR-19, BR-11
  - **Request chính:** optional `ngay_tra`, bắt buộc `tinh_trang_sau_tra`, optional `ghi_chu_tinh_trang`.
  - **Mô tả:** ghi nhận trả sách cho phiếu mượn theo `id`.
  - **Ràng buộc:** chỉ phiếu mượn chưa trả mới được xử lý; `Loan.status` chuyển thành `RETURNED` khi `tinh_trang_sau_tra = AVAILABLE`, ngược lại chuyển thành `NEEDS_REVIEW` khi bản sao trả về trạng thái cần kiểm tra/hỏng/mất.

### Kết quả
- Luồng mượn/trả được triển khai theo đúng BR-04/BR-05/BR-06/BR-10/BR-11.
- `Loan` và `BookCopy` được cập nhật đồng bộ trong transaction Prisma.
- `GET /api/v1/loans` dùng query param `limit` và trả phân trang trong `data.items` + `data.meta`.
- RBAC cho loans tuân thủ `LIBRARIAN` như các nghiệp vụ thư viện khác.
- `HttpExceptionFilter` giữ nguyên error envelope nhưng ưu tiên `error.code` từ domain response; các lỗi nghiệp vụ loans trả `409` với mã `BR_04_*`, `BR_06_*`, `BR_11_*`.
- `npm run lint`, `npm test -- --runInBand`, `npm run build` pass với loans module được bật.

---

## Phase 5 — Search + Reports + QA

### Mục tiêu
Hoàn thiện tra cứu sách và 2 báo cáo còn thiếu của hệ thống, đồng thời bổ sung test/QA tối thiểu cho Phase 5.

### Task
- [x] Tạo `search` module (`SearchModule`, `SearchService`, `SearchController`).
- [x] Tạo `reports` module (`ReportsModule`, `ReportsService`, `ReportsController`).
- [x] Tạo DTO cho search filters và report query params.
- [x] Thực hiện `GET /search/books` theo FR-14.
- [x] Thực hiện `GET /reports/top-borrowed-titles` theo FR-20, BR-12.
- [x] Thực hiện `GET /reports/unreturned-readers` theo FR-21.
- [x] Áp dụng soft delete filtering nhất quán cho search/reports queries.
- [x] Thêm unit test cho `SearchService`.
- [x] Thêm unit test cho `ReportsService`.
- [x] Thêm e2e test cơ bản cho search/reports (ít nhất cover `401`, `403`, `400` ở các endpoint mới).
- [x] Chặn `page` vượt ngưỡng (`page <= 1000`) cho search/reports để tránh offset quá lớn.
- [x] Siết validation date range cho `top-borrowed-titles`: `from <= to`, đúng format `YYYY-MM-DD`, và tối đa `366 ngày`.
- [ ] Chạy `npm run lint`.
- [ ] Chạy `npm test -- --runInBand`.
- [ ] Chạy `npm run build`.
- [ ] Chạy `npm run test:e2e`.

### API đã tạo trong Phase 5

#### Search API

- `GET /api/v1/search/books`
  - **Quyền:** `LIBRARIAN`, `LEADER`
  - **FR/BR:** FR-14
  - **Query chính:** `page`, `limit`, `ma_dau_sach`, `ten_dau_sach`, `tac_gia`, `ma_chuyen_nganh`, `ma_sach`, `tinh_trang`
  - **Mô tả:** tra cứu sách theo nhiều tiêu chí, trả kết quả theo title-centric shape kèm `ban_sao_phu_hop` và `so_luong_sach`.

#### Reports API

- `GET /api/v1/reports/top-borrowed-titles`
  - **Quyền:** `LIBRARIAN`, `LEADER`
  - **FR/BR:** FR-20, BR-12
  - **Query chính:** `from`, `to`, `page`, `limit`
  - **Mô tả:** thống kê đầu sách được mượn nhiều nhất trong kỳ, aggregate theo title chứ không theo copy.
- `GET /api/v1/reports/unreturned-readers`
  - **Quyền:** `LIBRARIAN`, `LEADER`
  - **FR/BR:** FR-21
  - **Query chính:** `page`, `limit`
  - **Mô tả:** danh sách độc giả đang có phiếu mượn chưa hoàn tất, trả kèm `phieu_muon_dang_mo` và `so_phieu_muon_dang_mo`.

### Kết quả
- Search API và 2 report APIs của Phase 5 đã được wiring vào app.
- Search/reports dùng success envelope thống nhất với runtime hiện tại.
- BR-12 được xử lý ở report top borrowed titles theo đầu sách.
- Đã bổ sung unit/e2e coverage nền cho Phase 5; còn bước cuối là chạy toàn bộ lint/test/build.

---

## Checklist trước khi chuyển phase tiếp theo

### Trước khi bắt đầu Phase 3
- [x] Xác nhận `.env.example` không chứa secret thật
- [x] Xác nhận strategy serialize `BigInt`
- [ ] Xác nhận vulnerability mức cao trong dependency tree đã được xử lý hoặc chấp nhận rủi ro tạm thời
- [x] Seed file cho account nền đã có
- [x] `.env.example` đã có seed env vars tối thiểu

### Trước khi bắt đầu Phase 4
- [x] Xác nhận schema hiện tại đủ để enforce business rules mượn/trả
- [x] Xác nhận transaction flow và error contract cho loans

### Trước khi chốt dự án
- [ ] So khớp lại toàn bộ với `docs/SRS.md`
- [ ] So khớp lại toàn bộ với `docs/API_REFERENCE.md`
- [ ] Kiểm tra migration có thể deploy sạch trên môi trường Supabase
