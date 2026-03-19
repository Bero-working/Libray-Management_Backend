import { BookCopyStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateCopyDto {
  @IsString()
  ma_sach!: string;

  @IsString()
  ma_dau_sach!: string;

  @IsEnum(BookCopyStatus)
  tinh_trang!: BookCopyStatus;

  @IsDateString()
  ngay_nhap!: string;
}
