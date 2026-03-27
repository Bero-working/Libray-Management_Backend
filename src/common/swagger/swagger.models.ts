import { ApiProperty } from '@nestjs/swagger';
import {
  AccountRole,
  AccountStatus,
  BookCopyStatus,
  Gender,
  LoanStatus,
  ReaderStatus,
  StaffStatus,
} from '@prisma/client';

export class SuccessFlagDto {
  @ApiProperty({ example: true })
  success!: true;
}

export class ErrorBodyDto {
  @ApiProperty({ example: 'NOT_FOUND' })
  code!: string;

  @ApiProperty({ example: 'Resource not found' })
  message!: string;
}

export class ErrorEnvelopeDto {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ type: () => ErrorBodyDto })
  error!: ErrorBodyDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, minimum: 1 })
  page!: number;

  @ApiProperty({ example: 20, minimum: 1 })
  limit!: number;

  @ApiProperty({ example: 125, minimum: 0 })
  total!: number;

  @ApiProperty({ example: 7, minimum: 1 })
  totalPages!: number;
}

export class DateRangePaginationMetaDto extends PaginationMetaDto {
  @ApiProperty({ example: '2026-03-01', format: 'date' })
  from!: string;

  @ApiProperty({ example: '2026-03-27', format: 'date' })
  to!: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'backend' })
  service!: 'backend';

  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  timestamp!: string;
}

export class StaffResponseDto {
  @ApiProperty({ example: '10' })
  id!: string;

  @ApiProperty({ example: 'NV001' })
  code!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName!: string;

  @ApiProperty({ example: 'nguyenvana@example.com' })
  contactInfo!: string;

  @ApiProperty({ enum: StaffStatus, example: StaffStatus.ACTIVE })
  status!: StaffStatus;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
    type: String,
  })
  deletedAt!: string | null;
}

export class AccountResponseDto {
  @ApiProperty({ example: '11' })
  id!: string;

  @ApiProperty({ example: 'librarian01' })
  username!: string;

  @ApiProperty({ enum: AccountRole, example: AccountRole.LIBRARIAN })
  role!: AccountRole;

  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  status!: AccountStatus;

  @ApiProperty({ example: '10' })
  staffId!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
    type: String,
  })
  deletedAt!: string | null;

  @ApiProperty({ type: () => StaffResponseDto })
  staff!: StaffResponseDto;
}

export class ReaderResponseDto {
  @ApiProperty({ example: '21' })
  id!: string;

  @ApiProperty({ example: 'DG001' })
  code!: string;

  @ApiProperty({ example: 'Tran Thi B' })
  fullName!: string;

  @ApiProperty({ example: 'CTK44A' })
  className!: string;

  @ApiProperty({
    example: '2004-09-12T00:00:00.000Z',
    format: 'date-time',
  })
  birthDate!: string;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  gender!: Gender;

  @ApiProperty({ enum: ReaderStatus, example: ReaderStatus.ACTIVE })
  status!: ReaderStatus;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
    type: String,
  })
  deletedAt!: string | null;
}

export class MajorResponseDto {
  @ApiProperty({ example: '31' })
  id!: string;

  @ApiProperty({ example: 'CNTT' })
  code!: string;

  @ApiProperty({ example: 'Cong nghe thong tin' })
  name!: string;

  @ApiProperty({
    example: 'Chuyen nganh cong nghe thong tin',
    nullable: true,
    type: String,
  })
  description!: string | null;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
    type: String,
  })
  deletedAt!: string | null;
}

export class TitleEntityResponseDto {
  @ApiProperty({ example: '41' })
  id!: string;

  @ApiProperty({ example: 'DS001' })
  code!: string;

  @ApiProperty({ example: 'Clean Code' })
  name!: string;

  @ApiProperty({ example: 'Prentice Hall' })
  publisher!: string;

  @ApiProperty({ example: 464, minimum: 1 })
  pageCount!: number;

  @ApiProperty({ example: '16 x 24 cm' })
  size!: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  author!: string;

  @ApiProperty({ example: '31' })
  majorId!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
    type: String,
  })
  deletedAt!: string | null;
}

export class TitleViewResponseDto {
  @ApiProperty({ example: 'DS001' })
  ma_dau_sach!: string;

  @ApiProperty({ example: 'Clean Code' })
  ten_dau_sach!: string;

  @ApiProperty({ example: 'Prentice Hall' })
  nha_xuat_ban!: string;

  @ApiProperty({ example: 464, minimum: 1 })
  so_trang!: number;

  @ApiProperty({ example: '16 x 24 cm' })
  kich_thuoc!: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  tac_gia!: string;

  @ApiProperty({ example: 'CNTT' })
  ma_chuyen_nganh!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  so_luong_sach!: number;
}

export class CopyEntityResponseDto {
  @ApiProperty({ example: '51' })
  id!: string;

  @ApiProperty({ example: 'S001' })
  code!: string;

  @ApiProperty({ example: '41' })
  bookTitleId!: string;

  @ApiProperty({ enum: BookCopyStatus, example: BookCopyStatus.AVAILABLE })
  status!: BookCopyStatus;

  @ApiProperty({
    example: '2026-03-10T00:00:00.000Z',
    format: 'date-time',
  })
  acquiredAt!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-03-27T15:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
    type: String,
  })
  deletedAt!: string | null;
}

export class CopyViewResponseDto {
  @ApiProperty({ example: 'S001' })
  ma_sach!: string;

  @ApiProperty({ example: 'DS001' })
  ma_dau_sach!: string;

  @ApiProperty({ enum: BookCopyStatus, example: BookCopyStatus.AVAILABLE })
  tinh_trang!: BookCopyStatus;

  @ApiProperty({
    example: '2026-03-10T00:00:00.000Z',
    format: 'date-time',
  })
  ngay_nhap!: string;
}

export class LoanViewResponseDto {
  @ApiProperty({ example: '61' })
  id!: string;

  @ApiProperty({ example: 'DG001' })
  ma_doc_gia!: string;

  @ApiProperty({ example: 'S001' })
  ma_sach!: string;

  @ApiProperty({ example: 'NV001' })
  ma_thu_thu!: string;

  @ApiProperty({
    example: '2026-03-20T08:00:00.000Z',
    format: 'date-time',
  })
  ngay_muon!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    format: 'date-time',
    type: String,
  })
  ngay_tra!: string | null;

  @ApiProperty({ enum: LoanStatus, example: LoanStatus.BORROWED })
  tinh_trang!: LoanStatus;

  @ApiProperty({
    example: 'Sach con moi',
    nullable: true,
    type: String,
  })
  ghi_chu_tinh_trang!: string | null;
}

export class SearchMatchedCopyDto {
  @ApiProperty({ example: 'S001' })
  ma_sach!: string;

  @ApiProperty({ enum: BookCopyStatus, example: BookCopyStatus.AVAILABLE })
  tinh_trang!: BookCopyStatus;
}

export class SearchBookResultDto {
  @ApiProperty({ example: 'DS001' })
  ma_dau_sach!: string;

  @ApiProperty({ example: 'Clean Code' })
  ten_dau_sach!: string;

  @ApiProperty({ example: 'Prentice Hall' })
  nha_xuat_ban!: string;

  @ApiProperty({ example: 464, minimum: 1 })
  so_trang!: number;

  @ApiProperty({ example: '16 x 24 cm' })
  kich_thuoc!: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  tac_gia!: string;

  @ApiProperty({ example: 'CNTT' })
  ma_chuyen_nganh!: string;

  @ApiProperty({ example: 'Cong nghe thong tin' })
  ten_chuyen_nganh!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  so_luong_sach!: number;

  @ApiProperty({ type: () => SearchMatchedCopyDto, isArray: true })
  ban_sao_phu_hop!: SearchMatchedCopyDto[];
}

export class TopBorrowedTitleItemDto {
  @ApiProperty({ example: 1, minimum: 1 })
  rank!: number;

  @ApiProperty({ example: 'DS001' })
  ma_dau_sach!: string;

  @ApiProperty({ example: 'Clean Code' })
  ten_dau_sach!: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  tac_gia!: string;

  @ApiProperty({ example: 'CNTT' })
  ma_chuyen_nganh!: string;

  @ApiProperty({ example: 'Cong nghe thong tin' })
  ten_chuyen_nganh!: string;

  @ApiProperty({ example: 27, minimum: 0 })
  so_luot_muon!: number;
}

export class UnreturnedLoanItemDto {
  @ApiProperty({ example: '61' })
  loan_id!: string;

  @ApiProperty({ example: 'S001' })
  ma_sach!: string;

  @ApiProperty({ example: 'DS001' })
  ma_dau_sach!: string;

  @ApiProperty({ example: 'Clean Code' })
  ten_dau_sach!: string;

  @ApiProperty({
    example: '2026-03-20T08:00:00.000Z',
    format: 'date-time',
  })
  ngay_muon!: string;

  @ApiProperty({ enum: LoanStatus, example: LoanStatus.BORROWED })
  tinh_trang!: LoanStatus;
}

export class UnreturnedReaderItemDto {
  @ApiProperty({ example: 'DG001' })
  ma_doc_gia!: string;

  @ApiProperty({ example: 'Tran Thi B' })
  ho_ten!: string;

  @ApiProperty({ example: 'CTK44A' })
  lop!: string;

  @ApiProperty({ enum: ReaderStatus, example: ReaderStatus.ACTIVE })
  trang_thai!: ReaderStatus;

  @ApiProperty({ example: 2, minimum: 0 })
  so_phieu_muon_dang_mo!: number;

  @ApiProperty({ type: () => UnreturnedLoanItemDto, isArray: true })
  phieu_muon_dang_mo!: UnreturnedLoanItemDto[];
}

export class AuthenticatedUserResponseDto {
  @ApiProperty({ example: '11' })
  id!: string;

  @ApiProperty({ enum: AccountRole, example: AccountRole.ADMIN })
  role!: AccountRole;

  @ApiProperty({ example: 'NV001' })
  staffCode!: string;

  @ApiProperty({ example: '10' })
  staffId!: string;

  @ApiProperty({ example: 'admin01' })
  username!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token',
  })
  refreshToken!: string;

  @ApiProperty({ type: () => AuthenticatedUserResponseDto })
  user!: AuthenticatedUserResponseDto;
}

export class RefreshTokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token',
  })
  refreshToken!: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
