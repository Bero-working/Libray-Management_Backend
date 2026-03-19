import { BookCopyStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class ReturnLoanDto {
  @IsOptional()
  @IsDateString()
  ngay_tra?: string;

  @IsEnum(BookCopyStatus)
  tinh_trang_sau_tra!: BookCopyStatus;

  @IsOptional()
  @IsString()
  ghi_chu_tinh_trang?: string;
}
