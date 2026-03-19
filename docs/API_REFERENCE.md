# API REFERENCE

## 1. Mục tiêu

Tài liệu này đặc tả API cho hệ thống quản lý thư viện, được suy ra từ:

- `docs/SRS.md`
- `docs/DATABASE_SCHEMA.md`

Phạm vi API bao phủ các nghiệp vụ FR-01 -> FR-24 và business rules BR-01 -> BR-12.

---

## 2. Quy ước chung

### 2.1 Base URL

`/api/v1`

### 2.2 Xác thực

- Cơ chế: Bearer token.
- Header bắt buộc cho API bảo vệ:

```http
Authorization: Bearer <access_token>
```

### 2.3 Phân quyền (RBAC)

- `ADMIN`: quản trị nhân viên, tài khoản, phân quyền.
- `LIBRARIAN`: nghiệp vụ thư viện (độc giả, sách, mượn trả, báo cáo).
- `LEADER`: chỉ xem báo cáo.

### 2.4 Content-Type

- Request body: `application/json`
- Response mặc định: `application/json`
- Riêng API in thẻ có thể trả `application/pdf`

### 2.5 Định dạng thời gian

- Kiểu ngày: `YYYY-MM-DD` (ví dụ `2026-03-18`)

### 2.6 Phân trang

Query params chuẩn:

- `page` (mặc định `1`)
- `page_size` (mặc định `20`, tối đa `100`)

### 2.7 Mẫu response thành công

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### 2.8 Mẫu response lỗi

```json
{
  "success": false,
  "error": {
    "code": "BR_04_ACTIVE_LOAN_EXISTS",
    "message": "Độc giả đang có phiếu mượn chưa trả",
    "details": {
      "ma_doc_gia": "DG001"
    }
  }
}
```

### 2.9 Enum chuẩn hoá

- `DOC_GIA.trang_thai`: `HOAT_DONG`, `KHOA`, `NGUNG`
- `BAN_SAO_SACH.tinh_trang`: `SAN_SANG`, `DANG_MUON`, `HU_HONG`, `MAT`, `CAN_XU_LY`
- `PHIEU_MUON.tinh_trang`: `DANG_MUON`, `DA_TRA`, `CAN_XU_LY`
- `TAI_KHOAN.role`: `ADMIN`, `LIBRARIAN`, `LEADER`

---

## 3. Danh mục endpoint

| Nhóm | Endpoint |
|---|---|
| Auth | `POST /auth/login` |
| Readers | `GET/POST /readers`, `GET/PATCH/DELETE /readers/{ma_doc_gia}`, `POST /readers/{ma_doc_gia}/print-card` |
| Majors | `GET/POST /majors`, `GET/PATCH/DELETE /majors/{ma_chuyen_nganh}` |
| Titles | `GET/POST /titles`, `GET/PATCH/DELETE /titles/{ma_dau_sach}` |
| Copies | `GET/POST /copies`, `GET/PATCH/DELETE /copies/{ma_sach}` |
| Search | `GET /search/books` |
| Loans | `GET /loans`, `GET /loans/{id}`, `POST /loans`, `PATCH /loans/{id}/return` |
| Reports | `GET /reports/top-borrowed-titles`, `GET /reports/unreturned-readers` |
| Staff | `GET/POST /staff`, `GET/PATCH/DELETE /staff/{ma_nhan_vien}` |
| Accounts | `GET/POST /accounts`, `GET/PATCH/DELETE /accounts/{username}` |

---

## 4. Auth API

### 4.1 Đăng nhập

`POST /auth/login`

- **Quyền:** Public
- **FR/BR:** FR-01, BR-01

Request:

```json
{
  "username": "librarian01",
  "password": "your_password"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "access_token": "<jwt_or_token>",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "username": "librarian01",
      "ma_nhan_vien": "NV001",
      "role": "LIBRARIAN",
      "trang_thai": "HOAT_DONG"
    }
  }
}
```

Lỗi thường gặp:

- `401 AUTH_INVALID_CREDENTIALS`
- `403 AUTH_ACCOUNT_INACTIVE`

---

## 5. Readers API (DOC_GIA)

### 5.1 Danh sách độc giả

`GET /readers`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-03, FR-05, FR-06
- Query hỗ trợ: `q`, `lop`, `trang_thai`, `page`, `page_size`

### 5.2 Chi tiết độc giả

`GET /readers/{ma_doc_gia}`

- **Quyền:** `LIBRARIAN`

### 5.3 Tạo độc giả/thẻ thư viện

`POST /readers`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-03, BR-02

Request:

```json
{
  "ma_doc_gia": "DG001",
  "ho_ten": "Nguyen Van A",
  "lop": "CNTT-K18",
  "ngay_sinh": "2004-09-10",
  "gioi_tinh": "NAM",
  "trang_thai": "HOAT_DONG"
}
```

Response `201`: trả về bản ghi độc giả vừa tạo.

### 5.4 Cập nhật độc giả

`PATCH /readers/{ma_doc_gia}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-05

### 5.5 Xóa độc giả

`DELETE /readers/{ma_doc_gia}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-06, BR-09

Ràng buộc:

- Không cho xóa nếu độc giả đang có phiếu mượn chưa trả.
- Trả `409 BR_09_READER_HAS_UNRETURNED_LOAN` khi vi phạm.

### 5.6 In thẻ thư viện

`POST /readers/{ma_doc_gia}/print-card`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-04

Response:

- `200 application/pdf` (file thẻ in)
- hoặc `200 application/json` chứa thông tin print payload (tuỳ triển khai)

---

## 6. Majors API (CHUYEN_NGANH)

### 6.1 Danh sách chuyên ngành

`GET /majors`

- **Quyền:** `LIBRARIAN`

### 6.2 Chi tiết chuyên ngành

`GET /majors/{ma_chuyen_nganh}`

- **Quyền:** `LIBRARIAN`

### 6.3 Tạo chuyên ngành

`POST /majors`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-07, BR-02

Request:

```json
{
  "ma_chuyen_nganh": "CN001",
  "ten_chuyen_nganh": "Cong nghe thong tin",
  "mo_ta": "Nhom nganh CNTT"
}
```

### 6.4 Cập nhật chuyên ngành

`PATCH /majors/{ma_chuyen_nganh}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-07

### 6.5 Xóa chuyên ngành

`DELETE /majors/{ma_chuyen_nganh}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-07

Ràng buộc:

- Không cho xóa nếu còn `DAU_SACH` tham chiếu.

---

## 7. Titles API (DAU_SACH)

### 7.1 Danh sách đầu sách

`GET /titles`

- **Quyền:** `LIBRARIAN`
- Query: `q`, `ma_chuyen_nganh`, `tac_gia`, `page`, `page_size`

Response item (ví dụ):

```json
{
  "ma_dau_sach": "DS001",
  "ten_dau_sach": "Co so du lieu",
  "nha_xuat_ban": "NXB Giao Duc",
  "so_trang": 320,
  "kich_thuoc": "16x24",
  "tac_gia": "Le B",
  "ma_chuyen_nganh": "CN001",
  "so_luong_sach": 12
}
```

> `so_luong_sach` là **giá trị suy ra** từ số bản sao trong `BAN_SAO_SACH`, không phải cột lưu trữ chuẩn theo ERD hiện tại.

### 7.2 Chi tiết đầu sách

`GET /titles/{ma_dau_sach}`

- **Quyền:** `LIBRARIAN`

### 7.3 Tạo đầu sách

`POST /titles`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-08, BR-02

Request:

```json
{
  "ma_dau_sach": "DS001",
  "ten_dau_sach": "Co so du lieu",
  "nha_xuat_ban": "NXB Giao Duc",
  "so_trang": 320,
  "kich_thuoc": "16x24",
  "tac_gia": "Le B",
  "ma_chuyen_nganh": "CN001"
}
```

### 7.4 Cập nhật đầu sách

`PATCH /titles/{ma_dau_sach}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-09

### 7.5 Xóa đầu sách

`DELETE /titles/{ma_dau_sach}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-10, BR-07

Ràng buộc:

- Không cho xóa nếu còn bản sao sách hoặc giao dịch chưa xử lý.
- Trả `409 BR_07_TITLE_HAS_DEPENDENCIES` khi vi phạm.

---

## 8. Copies API (BAN_SAO_SACH)

### 8.1 Danh sách bản sao

`GET /copies`

- **Quyền:** `LIBRARIAN`
- Query: `ma_dau_sach`, `tinh_trang`, `page`, `page_size`

### 8.2 Chi tiết bản sao

`GET /copies/{ma_sach}`

- **Quyền:** `LIBRARIAN`

### 8.3 Tạo bản sao

`POST /copies`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-11, BR-02, BR-03

Request:

```json
{
  "ma_sach": "S001",
  "ma_dau_sach": "DS001",
  "tinh_trang": "SAN_SANG",
  "ngay_nhap": "2026-03-01"
}
```

### 8.4 Cập nhật bản sao

`PATCH /copies/{ma_sach}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-12

Ghi chú:

- Trạng thái `DANG_MUON` nên do luồng lập phiếu mượn cập nhật.
- Trạng thái sau trả sách nên do luồng trả sách cập nhật.

### 8.5 Xóa bản sao

`DELETE /copies/{ma_sach}`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-13, BR-08

Ràng buộc:

- Không cho xóa khi bản sao đang mượn hoặc gắn với phiếu mượn chưa hoàn tất.
- Trả `409 BR_08_COPY_HAS_ACTIVE_LOAN` khi vi phạm.

---

## 9. Search API

### 9.1 Tra cứu sách

`GET /search/books`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-14

Query params:

- `ma_dau_sach`
- `ten_dau_sach`
- `tac_gia`
- `ma_chuyen_nganh`
- `ma_sach`
- `tinh_trang`
- `page`, `page_size`

Response trả danh sách bản sao kèm thông tin đầu sách và chuyên ngành để phục vụ tra cứu tại quầy.

---

## 10. Loans API (PHIEU_MUON)

### 10.1 Danh sách phiếu mượn

`GET /loans`

- **Quyền:** `LIBRARIAN`
- Query: `ma_doc_gia`, `ma_sach`, `tinh_trang`, `from_date`, `to_date`, `page`, `page_size`

### 10.2 Chi tiết phiếu mượn

`GET /loans/{id}`

- **Quyền:** `LIBRARIAN`

### 10.3 Lập phiếu mượn

`POST /loans`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-15, FR-16, FR-17, BR-04, BR-05, BR-06, BR-10

Request:

```json
{
  "ma_sach": "S001",
  "ma_doc_gia": "DG001",
  "ngay_muon": "2026-03-18"
}
```

Quy tắc xử lý bắt buộc:

1. Độc giả tồn tại và thẻ hợp lệ (`DOC_GIA.trang_thai = HOAT_DONG`).
2. Độc giả không có phiếu mượn chưa trả.
3. Bản sao đang ở trạng thái `SAN_SANG`.
4. `ma_thu_thu` lấy từ tài khoản đăng nhập hợp lệ vai trò `LIBRARIAN`.
5. Tạo phiếu mượn + cập nhật `BAN_SAO_SACH.tinh_trang = DANG_MUON` trong cùng transaction.

Response `201`:

```json
{
  "success": true,
  "data": {
    "id": 1001,
    "ma_sach": "S001",
    "ma_doc_gia": "DG001",
    "ma_thu_thu": "NV001",
    "ngay_muon": "2026-03-18",
    "ngay_tra": null,
    "tinh_trang": "DANG_MUON",
    "ghi_chu_tinh_trang": null
  }
}
```

Lỗi nghiệp vụ thường gặp:

- `409 BR_04_ACTIVE_LOAN_EXISTS`
- `409 BR_06_COPY_NOT_AVAILABLE`
- `422 READER_CARD_INVALID`

### 10.4 Ghi nhận trả sách

`PATCH /loans/{id}/return`

- **Quyền:** `LIBRARIAN`
- **FR/BR:** FR-18, FR-19, BR-11

Request:

```json
{
  "ngay_tra": "2026-03-25",
  "tinh_trang_sach_sau_tra": "SAN_SANG",
  "ghi_chu_tinh_trang": "Sach nguyen ven"
}
```

Quy tắc cập nhật:

- Chỉ xử lý với phiếu đang mở (`tinh_trang = DANG_MUON`).
- Cập nhật `PHIEU_MUON.ngay_tra`.
- Nếu `tinh_trang_sach_sau_tra = SAN_SANG` -> `PHIEU_MUON.tinh_trang = DA_TRA`.
- Nếu khác `SAN_SANG` -> `PHIEU_MUON.tinh_trang = CAN_XU_LY`.
- Đồng bộ `BAN_SAO_SACH.tinh_trang` theo `tinh_trang_sach_sau_tra` trong cùng transaction.

---

## 11. Reports API

### 11.1 Báo cáo đầu sách mượn nhiều

`GET /reports/top-borrowed-titles`

- **Quyền:** `LIBRARIAN`, `LEADER`, `ADMIN`
- **FR/BR:** FR-20, BR-12
- Query: `from_date`, `to_date`, `limit` (mặc định `10`)

Response item:

```json
{
  "ma_dau_sach": "DS001",
  "ten_dau_sach": "Co so du lieu",
  "luot_muon": 52
}
```

### 11.2 Báo cáo độc giả chưa trả sách

`GET /reports/unreturned-readers`

- **Quyền:** `LIBRARIAN`, `LEADER`, `ADMIN`
- **FR/BR:** FR-21
- Query: `as_of_date` (optional)

Response item:

```json
{
  "ma_doc_gia": "DG001",
  "ho_ten": "Nguyen Van A",
  "lop": "CNTT-K18",
  "ma_sach": "S001",
  "ma_dau_sach": "DS001",
  "ten_dau_sach": "Co so du lieu",
  "ngay_muon": "2026-03-18",
  "so_ngay_muon": 7
}
```

---

## 12. Staff API (NHAN_VIEN)

### 12.1 Danh sách nhân viên

`GET /staff`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-22

### 12.2 Chi tiết nhân viên

`GET /staff/{ma_nhan_vien}`

- **Quyền:** `ADMIN`

### 12.3 Tạo nhân viên

`POST /staff`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-22, BR-02

Request:

```json
{
  "ma_nhan_vien": "NV001",
  "ho_ten": "Tran Thi B",
  "thong_tin_lien_he": "tranb@university.edu",
  "trang_thai": "HOAT_DONG"
}
```

### 12.4 Cập nhật nhân viên

`PATCH /staff/{ma_nhan_vien}`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-22

### 12.5 Xóa nhân viên

`DELETE /staff/{ma_nhan_vien}`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-22

Ràng buộc:

- Không cho xóa nếu còn tài khoản liên kết hoặc còn tham chiếu trong lịch sử phiếu mượn.
- Khuyến nghị nghiệp vụ: ưu tiên khóa/ngừng hoạt động thay vì xóa cứng.

---

## 13. Accounts API (TAI_KHOAN)

### 13.1 Danh sách tài khoản

`GET /accounts`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-23, FR-24

### 13.2 Chi tiết tài khoản

`GET /accounts/{username}`

- **Quyền:** `ADMIN`

### 13.3 Tạo tài khoản và gán quyền

`POST /accounts`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-23, FR-24, BR-02

Request:

```json
{
  "username": "librarian01",
  "password": "secure_password",
  "role": "LIBRARIAN",
  "ma_nhan_vien": "NV001",
  "trang_thai": "HOAT_DONG"
}
```

Ràng buộc:

- `username` unique.
- `ma_nhan_vien` unique trong bảng tài khoản để đảm bảo quan hệ 1 - 0..1 với `NHAN_VIEN`.

### 13.4 Cập nhật tài khoản/phân quyền

`PATCH /accounts/{username}`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-24

Cho phép cập nhật:

- `role`
- `trang_thai`
- `new_password` (nếu cần đổi mật khẩu)

### 13.5 Xóa tài khoản

`DELETE /accounts/{username}`

- **Quyền:** `ADMIN`
- **FR/BR:** FR-23, FR-24

---

## 14. HTTP status code sử dụng

- `200 OK`: lấy dữ liệu/cập nhật thành công
- `201 Created`: tạo mới thành công
- `204 No Content`: xóa thành công
- `400 Bad Request`: request sai định dạng
- `401 Unauthorized`: chưa đăng nhập hoặc token sai
- `403 Forbidden`: không đủ quyền
- `404 Not Found`: không tìm thấy tài nguyên
- `409 Conflict`: vi phạm ràng buộc business/data
- `422 Unprocessable Entity`: dữ liệu hợp lệ JSON nhưng sai rule/validation
- `500 Internal Server Error`: lỗi hệ thống

---

## 15. Mapping FR/BR -> API

### 15.1 Functional requirements

| FR | API chính |
|---|---|
| FR-01 | `POST /auth/login` |
| FR-02 | RBAC áp dụng toàn hệ thống |
| FR-03, FR-05, FR-06 | `POST/PATCH/DELETE /readers` |
| FR-04 | `POST /readers/{ma_doc_gia}/print-card` |
| FR-07 | `POST/PATCH/DELETE /majors` |
| FR-08, FR-09, FR-10 | `POST/PATCH/DELETE /titles` |
| FR-11, FR-12, FR-13 | `POST/PATCH/DELETE /copies` |
| FR-14 | `GET /search/books` |
| FR-15, FR-16, FR-17 | `POST /loans` |
| FR-18, FR-19 | `PATCH /loans/{id}/return` |
| FR-20 | `GET /reports/top-borrowed-titles` |
| FR-21 | `GET /reports/unreturned-readers` |
| FR-22 | `POST/PATCH/DELETE /staff` |
| FR-23, FR-24 | `POST/PATCH/DELETE /accounts` |

### 15.2 Business rules

| BR | API cưỡng chế chính |
|---|---|
| BR-01 | Tất cả endpoint bảo vệ yêu cầu token |
| BR-02 | Tạo mới/cập nhật ở tất cả module liên quan định danh |
| BR-03 | `POST /copies` |
| BR-04 | `POST /loans` |
| BR-05 | `POST /loans` |
| BR-06 | `POST /loans` |
| BR-07 | `DELETE /titles/{ma_dau_sach}` |
| BR-08 | `DELETE /copies/{ma_sach}` |
| BR-09 | `DELETE /readers/{ma_doc_gia}` |
| BR-10 | `POST /loans` |
| BR-11 | `PATCH /loans/{id}/return` |
| BR-12 | `GET /reports/top-borrowed-titles` |

---

## 16. Ghi chú triển khai

1. Các thao tác mượn/trả phải dùng transaction để đảm bảo đồng bộ `PHIEU_MUON` và `BAN_SAO_SACH`.
2. Rule “mỗi độc giả chỉ có tối đa 1 phiếu mượn chưa trả” cần cưỡng chế ở DB (nếu hỗ trợ) và/hoặc service layer.
3. `so_luong_sach` nên trả dạng computed field từ số bản sao, không lưu cứng ở schema vòng hiện tại.
4. `FR-25` (audit fields) là khuyến nghị; có thể bổ sung ở migration/DTO trong vòng implement tiếp theo.

---

**Hết tài liệu.**
