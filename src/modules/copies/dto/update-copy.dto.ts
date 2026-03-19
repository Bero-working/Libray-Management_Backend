import { BookCopyStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateCopyDto {
  @IsOptional()
  @IsEnum(BookCopyStatus)
  tinh_trang?: BookCopyStatus;

  @IsOptional()
  @IsDateString()
  ngay_nhap?: string;
}
