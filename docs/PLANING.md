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
| Phase 3 | Readers + Catalog + print-card PDF | Pending |
| Phase 4 | Loans transaction core | Pending |
| Phase 5 | Search + Reports + QA | Pending |

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

#### `POST /api/v1/auth/login`
**Mục đích:** đăng nhập bằng username/password và nhận access + refresh token.

**Request body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Validation:**
- `username`: string
- `password`: string, tối thiểu 8 ký tự

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt-access-token>",
    "refreshToken": "<jwt-refresh-token>",
    "user": {
      "id": "1",
      "role": "ADMIN",
      "staffCode": "NV_ADMIN_001",
      "staffId": "1",
      "username": "admin"
    }
  }
}
```

**Điều kiện:**
- public
- bị rate limit `5 request / 60 giây`
- account phải tồn tại, chưa soft delete
- password phải đúng
- account phải `ACTIVE`
- staff liên kết phải `ACTIVE` và chưa soft delete

**Lỗi thường gặp:**
- `400 BAD_REQUEST`: body không hợp lệ
- `401 UNAUTHORIZED`: sai credentials
- `403 FORBIDDEN`: account inactive

---

#### `POST /api/v1/auth/refresh`
**Mục đích:** nhận refresh token và rotate sang cặp token mới.

**Request body:**
```json
{
  "refreshToken": "<jwt-refresh-token>"
}
```

**Validation:**
- `refreshToken`: string

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "<new-access-token>",
    "refreshToken": "<new-refresh-token>"
  }
}
```

**Điều kiện:**
- public
- bị rate limit `10 request / 60 giây`
- token phải verify được bằng refresh secret
- `tokenType` phải là `refresh`
- account phải còn tồn tại và active
- `refreshToken` phải khớp với `refreshTokenHash` đang lưu trong DB

**Lỗi thường gặp:**
- `400 BAD_REQUEST`: body không hợp lệ
- `401 UNAUTHORIZED`: refresh token không hợp lệ
- `403 FORBIDDEN`: account inactive

---

#### `POST /api/v1/auth/logout`
**Mục đích:** thu hồi refresh token hiện tại bằng cách clear `refreshTokenHash`.

**Request body:**
```json
{
  "refreshToken": "<jwt-refresh-token>"
}
```

**Validation:**
- `refreshToken`: string

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Điều kiện:**
- public
- bị rate limit `10 request / 60 giây`
- token phải verify được bằng refresh secret
- `tokenType` phải là `refresh`
- token gửi lên phải khớp với hash đang lưu trong DB

**Lỗi thường gặp:**
- `400 BAD_REQUEST`: body không hợp lệ
- `401 UNAUTHORIZED`: refresh token không hợp lệ

---

#### `POST /api/v1/staff`
**Mục đích:** tạo nhân viên thư viện.

**Request body:**
```json
{
  "code": "NV001",
  "fullName": "Tran Thi B",
  "contactInfo": "tranb@university.edu",
  "status": "ACTIVE"
}
```

**Validation:**
- `code`: string
- `fullName`: string
- `contactInfo`: string
- `status`: `ACTIVE | INACTIVE`

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "code": "NV001",
    "fullName": "Tran Thi B",
    "contactInfo": "tranb@university.edu",
    "status": "ACTIVE",
    "createdAt": "2026-03-19T00:00:00.000Z",
    "updatedAt": "2026-03-19T00:00:00.000Z",
    "deletedAt": null
  }
}
```

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- `code` không được trùng

**Lỗi thường gặp:**
- `401 UNAUTHORIZED`: thiếu/sai token
- `403 FORBIDDEN`: không phải `ADMIN`
- `409 CONFLICT`: trùng `code`

---

#### `GET /api/v1/staff`
**Mục đích:** lấy danh sách staff chưa bị soft delete.

**Request body:** không có.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "NV001",
      "fullName": "Tran Thi B",
      "contactInfo": "tranb@university.edu",
      "status": "ACTIVE",
      "createdAt": "2026-03-19T00:00:00.000Z",
      "updatedAt": "2026-03-19T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- query mặc định chỉ lấy `deletedAt = null`

---

#### `GET /api/v1/staff/:code`
**Mục đích:** lấy chi tiết staff theo `code`.

**Request body:** không có.

**Response `200`:** giống item trong list.

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- staff phải tồn tại và chưa soft delete

**Lỗi thường gặp:**
- `404 NOT_FOUND`: staff không tồn tại

---

#### `PATCH /api/v1/staff/:code`
**Mục đích:** cập nhật staff.

**Request body:**
```json
{
  "fullName": "Tran Thi B Updated",
  "contactInfo": "tranb.updated@university.edu",
  "status": "INACTIVE"
}
```

**Validation:**
- tất cả field optional
- `status`: `ACTIVE | INACTIVE`

**Response `200`:** object staff sau cập nhật.

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- staff phải tồn tại và chưa soft delete

**Lỗi thường gặp:**
- `404 NOT_FOUND`
- `409 CONFLICT`

---

#### `DELETE /api/v1/staff/:code`
**Mục đích:** soft delete staff bằng cách set `deletedAt`.

**Request body:** không có.

**Response `200`:** object staff sau khi soft delete.

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- staff phải tồn tại

---

#### `POST /api/v1/accounts`
**Mục đích:** tạo account cho staff.

**Request body:**
```json
{
  "username": "librarian01",
  "password": "secure-password",
  "role": "LIBRARIAN",
  "staffCode": "NV001",
  "status": "ACTIVE"
}
```

**Validation:**
- `username`: string
- `password`: string, tối thiểu 8 ký tự
- `role`: `ADMIN | LIBRARIAN | LEADER`
- `staffCode`: string
- `status`: `ACTIVE | LOCKED | INACTIVE`

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "librarian01",
    "role": "LIBRARIAN",
    "status": "ACTIVE",
    "staffId": "1",
    "createdAt": "2026-03-19T00:00:00.000Z",
    "updatedAt": "2026-03-19T00:00:00.000Z",
    "deletedAt": null,
    "staff": {
      "id": "1",
      "code": "NV001",
      "fullName": "Tran Thi B",
      "contactInfo": "tranb@university.edu",
      "status": "ACTIVE",
      "createdAt": "2026-03-19T00:00:00.000Z",
      "updatedAt": "2026-03-19T00:00:00.000Z",
      "deletedAt": null
    }
  }
}
```

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- `username` không được trùng
- staff phải tồn tại và chưa soft delete
- mỗi staff chỉ có tối đa 1 account
- password được hash trước khi lưu

**Lỗi thường gặp:**
- `404 NOT_FOUND`: staff không tồn tại
- `409 CONFLICT`: username trùng hoặc staff đã có account

---

#### `GET /api/v1/accounts`
**Mục đích:** lấy danh sách account chưa soft delete.

**Request body:** không có.

**Response `200`:** danh sách account, không chứa `passwordHash` hoặc `refreshTokenHash`.

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- chỉ lấy `deletedAt = null`

---

#### `GET /api/v1/accounts/:username`
**Mục đích:** lấy chi tiết account theo `username`.

**Request body:** không có.

**Response `200`:** object account an toàn như item list.

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- account phải tồn tại và chưa soft delete

**Lỗi thường gặp:**
- `404 NOT_FOUND`

---

#### `PATCH /api/v1/accounts/:username`
**Mục đích:** cập nhật role/status/password của account.

**Request body:**
```json
{
  "role": "LEADER",
  "status": "ACTIVE",
  "newPassword": "new-secure-password"
}
```

**Validation:**
- tất cả field optional
- `role`: `ADMIN | LIBRARIAN | LEADER`
- `status`: `ACTIVE | LOCKED | INACTIVE`
- `newPassword`: string, tối thiểu 8 ký tự

**Response `200`:** object account sau cập nhật.

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- account phải tồn tại và chưa soft delete
- nếu có `newPassword` thì phải hash trước khi lưu

**Lỗi thường gặp:**
- `404 NOT_FOUND`
- `409 CONFLICT`

---

#### `DELETE /api/v1/accounts/:username`
**Mục đích:** soft delete account và clear `refreshTokenHash`.

**Request body:** không có.

**Response `200`:** object account sau khi soft delete.

**Điều kiện:**
- cần Bearer access token hợp lệ
- role phải là `ADMIN`
- account phải tồn tại

### Seed data cho Phase 2

Đã thêm file seed:
- `prisma/seed.ts`

Đã thêm command:
- `npm run prisma:seed`

**Mục đích seed:** tạo 3 cặp staff/account mặc định cho:
- `ADMIN`
- `LIBRARIAN`
- `LEADER`

**Các account seed mặc định:**
- `admin` → role `ADMIN`
- `librarian` → role `LIBRARIAN`
- `leader` → role `LEADER`

**Staff code mặc định:**
- `NV_ADMIN_001`
- `NV_LIB_001`
- `NV_LEADER_001`

**Env bắt buộc để seed:**
- `SEED_ADMIN_PASSWORD`
- `SEED_LIBRARIAN_PASSWORD`
- `SEED_LEADER_PASSWORD`

**Cách chạy:**
```bash
npm run prisma:seed
```

**Hành vi seed:**
- chạy theo transaction cho từng cặp staff/account
- upsert staff theo `code`
- nếu staff đã có account thì update account theo `staffId`
- nếu chưa có account theo `staffId` thì upsert theo `username`
- hash password trước khi lưu
- reset `refreshTokenHash` về `null`
- set lại account/staff về trạng thái `ACTIVE`
- bỏ `deletedAt` nếu record đã từng bị soft delete

**Lưu ý an toàn:**
- chỉ dùng seed cho local/dev/test hoặc môi trường khởi tạo có kiểm soát
- không dùng seed này như cơ chế khôi phục account production hằng ngày
- seed có thể re-activate account mặc định nếu chạy lại
- sau khi seed xong nên đổi password nếu dùng ngoài môi trường local/dev

### Definition of Done
- `ADMIN` quản lý được staff và account
- Login / refresh / logout hoạt động đúng
- RBAC chặn truy cập sai role
- Không trả raw `BigInt` gây lỗi JSON

---

## Phase 3 — Readers + Catalog + print-card PDF

### Mục tiêu
Xây các module nghiệp vụ nền tảng của thư viện: độc giả và danh mục sách.

### Task
- [ ] Tạo `readers` module
- [ ] Tạo `majors` module
- [ ] Tạo `titles` module
- [ ] Tạo `copies` module
- [ ] Thực hiện `GET /readers`
- [ ] Thực hiện `GET /readers/{ma_doc_gia}`
- [ ] Thực hiện `POST /readers`
- [ ] Thực hiện `PATCH /readers/{ma_doc_gia}`
- [ ] Thực hiện soft delete cho `DELETE /readers/{ma_doc_gia}`
- [ ] Thực hiện `GET/POST/PATCH/DELETE` cho `majors`
- [ ] Thực hiện `GET/POST/PATCH/DELETE` cho `titles`
- [ ] Thực hiện `GET/POST/PATCH/DELETE` cho `copies`
- [ ] Thêm computed field `so_luong_sach` cho title response
- [ ] Áp dụng ràng buộc soft delete trong toàn bộ query danh mục
- [ ] Thiết kế payload in thẻ thư viện
- [ ] Chọn thư viện render PDF
- [ ] Thực hiện `POST /readers/{ma_doc_gia}/print-card` trả `application/pdf`
- [ ] Đảm bảo success interceptor không wrap response PDF
- [ ] Viết unit/integration test cho từng module CRUD
- [ ] Viết e2e test cho readers/catalog flows cơ bản

### Definition of Done
- Librarian quản lý được độc giả, chuyên ngành, đầu sách, bản sao sách
- `so_luong_sach` trả đúng theo số bản sao
- Print-card trả PDF thật

---

## Phase 4 — Loans transaction core

### Mục tiêu
Xây luồng mượn/trả là nghiệp vụ lõi của hệ thống, đảm bảo transaction và consistency.

### Task
- [ ] Tạo `loans` module
- [ ] Thực hiện `GET /loans`
- [ ] Thực hiện `GET /loans/{id}`
- [ ] Thực hiện `POST /loans`
- [ ] Thực hiện `PATCH /loans/{id}/return`
- [ ] Kiểm tra độc giả tồn tại và đang hoạt động
- [ ] Kiểm tra độc giả không có loan chưa trả
- [ ] Kiểm tra bản sao đang ở trạng thái sẵn sàng cho mượn
- [ ] Lấy `staff_id` từ user đăng nhập role `LIBRARIAN`
- [ ] Tạo loan và cập nhật trạng thái bản sao trong cùng transaction Prisma
- [ ] Khi trả sách, cập nhật `returned_at`, loan status và copy status trong cùng transaction
- [ ] Chuẩn hóa business error codes cho BR-04 / BR-06 / BR-10 / BR-11
- [ ] Viết integration test cho borrow happy path
- [ ] Viết integration test cho return happy path
- [ ] Viết test cho các case conflict: reader đã có loan mở, copy không sẵn sàng
- [ ] Viết concurrency test cho case nhiều request mượn cùng một copy

### Definition of Done
- Luồng mượn/trả hoạt động đúng rule nghiệp vụ
- Transaction đảm bảo dữ liệu nhất quán
- Các conflict quan trọng trả đúng mã lỗi và status code

---

## Phase 5 — Search + Reports + QA

### Mục tiêu
Hoàn thiện backend MVP theo SRS/API docs và chốt chất lượng cuối.

### Task
- [ ] Tạo `search` module
- [ ] Tạo `reports` module
- [ ] Thực hiện `GET /search/books`
- [ ] Hỗ trợ filter theo mã đầu sách, tên sách, tác giả, chuyên ngành, mã sách, tình trạng
- [ ] Thực hiện `GET /reports/top-borrowed-titles`
- [ ] Thực hiện `GET /reports/unreturned-readers`
- [ ] Kiểm tra quyền `LIBRARIAN`, `LEADER`, `ADMIN` đúng theo docs
- [ ] Tối ưu query aggregate cho report nếu cần
- [ ] Viết integration test cho search API
- [ ] Viết integration test cho report APIs
- [ ] Viết e2e test theo acceptance criteria trong `docs/SRS.md`
- [ ] Đối chiếu implementation với `docs/API_REFERENCE.md`
- [ ] Rà lại response format, status code, error code
- [ ] Cập nhật tài liệu nếu implementation thay đổi contract
- [ ] Chạy full verification cuối cùng

### Definition of Done
- Đạt MVP backend theo SRS
- Search và reports hoạt động đúng
- Tài liệu và code không lệch nhau ở các API đã triển khai

---

## Checklist trước khi chuyển phase tiếp theo

### Trước khi bắt đầu Phase 3
- [x] Xác nhận `.env.example` không chứa secret thật
- [x] Xác nhận strategy serialize `BigInt`
- [ ] Xác nhận vulnerability mức cao trong dependency tree đã được xử lý hoặc chấp nhận rủi ro tạm thời
- [x] Seed file cho account nền đã có
- [x] `.env.example` đã có seed env vars tối thiểu

### Trước khi bắt đầu Phase 4
- [ ] Xác nhận schema hiện tại đủ để enforce business rules mượn/trả
- [ ] Xác nhận transaction flow và error contract cho loans

### Trước khi chốt dự án
- [ ] So khớp lại toàn bộ với `docs/SRS.md`
- [ ] So khớp lại toàn bộ với `docs/API_REFERENCE.md`
- [ ] Kiểm tra migration có thể deploy sạch trên môi trường Supabase
