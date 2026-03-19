-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReaderStatus" AS ENUM ('ACTIVE', 'LOCKED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'BORROWED', 'DAMAGED', 'LOST', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('BORROWED', 'RETURNED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('ADMIN', 'LIBRARIAN', 'LEADER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'LOCKED', 'INACTIVE');

-- CreateTable
CREATE TABLE "readers" (
    "id" BIGSERIAL NOT NULL,
    "ma_doc_gia" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "lop" TEXT NOT NULL,
    "ngay_sinh" DATE NOT NULL,
    "gioi_tinh" "Gender" NOT NULL,
    "trang_thai" "ReaderStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "readers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "majors" (
    "id" BIGSERIAL NOT NULL,
    "ma_chuyen_nganh" TEXT NOT NULL,
    "ten_chuyen_nganh" TEXT NOT NULL,
    "mo_ta" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_titles" (
    "id" BIGSERIAL NOT NULL,
    "ma_dau_sach" TEXT NOT NULL,
    "ten_dau_sach" TEXT NOT NULL,
    "nha_xuat_ban" TEXT NOT NULL,
    "so_trang" INTEGER NOT NULL,
    "kich_thuoc" TEXT NOT NULL,
    "tac_gia" TEXT NOT NULL,
    "major_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "book_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_copies" (
    "id" BIGSERIAL NOT NULL,
    "ma_sach" TEXT NOT NULL,
    "book_title_id" BIGINT NOT NULL,
    "tinh_trang" "BookCopyStatus" NOT NULL,
    "ngay_nhap" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "book_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" BIGSERIAL NOT NULL,
    "ma_nhan_vien" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "thong_tin_lien_he" TEXT NOT NULL,
    "trang_thai" "StaffStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_accounts" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AccountRole" NOT NULL,
    "trang_thai" "AccountStatus" NOT NULL,
    "staff_id" BIGINT NOT NULL,
    "refresh_token_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "staff_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" BIGSERIAL NOT NULL,
    "reader_id" BIGINT NOT NULL,
    "book_copy_id" BIGINT NOT NULL,
    "staff_id" BIGINT NOT NULL,
    "ngay_muon" DATE NOT NULL,
    "ngay_tra" DATE,
    "tinh_trang" "LoanStatus" NOT NULL,
    "ghi_chu_tinh_trang" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "readers_ma_doc_gia_key" ON "readers"("ma_doc_gia");

-- CreateIndex
CREATE INDEX "readers_deleted_at_idx" ON "readers"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "majors_ma_chuyen_nganh_key" ON "majors"("ma_chuyen_nganh");

-- CreateIndex
CREATE INDEX "majors_deleted_at_idx" ON "majors"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "book_titles_ma_dau_sach_key" ON "book_titles"("ma_dau_sach");

-- CreateIndex
CREATE INDEX "book_titles_deleted_at_idx" ON "book_titles"("deleted_at");

-- CreateIndex
CREATE INDEX "book_titles_major_id_idx" ON "book_titles"("major_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_copies_ma_sach_key" ON "book_copies"("ma_sach");

-- CreateIndex
CREATE INDEX "book_copies_deleted_at_idx" ON "book_copies"("deleted_at");

-- CreateIndex
CREATE INDEX "book_copies_book_title_id_tinh_trang_idx" ON "book_copies"("book_title_id", "tinh_trang");

-- CreateIndex
CREATE UNIQUE INDEX "staff_ma_nhan_vien_key" ON "staff"("ma_nhan_vien");

-- CreateIndex
CREATE INDEX "staff_deleted_at_idx" ON "staff"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "staff_accounts_username_key" ON "staff_accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "staff_accounts_staff_id_key" ON "staff_accounts"("staff_id");

-- CreateIndex
CREATE INDEX "staff_accounts_deleted_at_idx" ON "staff_accounts"("deleted_at");

-- CreateIndex
CREATE INDEX "loans_deleted_at_idx" ON "loans"("deleted_at");

-- CreateIndex
CREATE INDEX "loans_reader_id_ngay_muon_idx" ON "loans"("reader_id", "ngay_muon" DESC);

-- CreateIndex
CREATE INDEX "loans_book_copy_id_ngay_muon_idx" ON "loans"("book_copy_id", "ngay_muon" DESC);

-- CreateIndex
CREATE INDEX "loans_tinh_trang_ngay_muon_idx" ON "loans"("tinh_trang", "ngay_muon" DESC);

-- AddForeignKey
ALTER TABLE "book_titles" ADD CONSTRAINT "book_titles_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_copies" ADD CONSTRAINT "book_copies_book_title_id_fkey" FOREIGN KEY ("book_title_id") REFERENCES "book_titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_accounts" ADD CONSTRAINT "staff_accounts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_book_copy_id_fkey" FOREIGN KEY ("book_copy_id") REFERENCES "book_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain consistency constraints
ALTER TABLE "loans"
  ADD CONSTRAINT "loans_returned_at_after_loaned_at_check"
  CHECK ("ngay_tra" IS NULL OR "ngay_tra" >= "ngay_muon");

-- Future-proof partial unique indexes for active loans
CREATE UNIQUE INDEX "loans_one_active_loan_per_reader"
ON "loans" ("reader_id")
WHERE "deleted_at" IS NULL AND "ngay_tra" IS NULL;

CREATE UNIQUE INDEX "loans_one_active_loan_per_copy"
ON "loans" ("book_copy_id")
WHERE "deleted_at" IS NULL AND "ngay_tra" IS NULL;
