import { Gender, ReaderStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateReaderDto {
  @IsOptional()
  @IsString()
  ho_ten?: string;

  @IsOptional()
  @IsString()
  lop?: string;

  @IsOptional()
  @IsDateString()
  ngay_sinh?: string;

  @IsOptional()
  @IsEnum(Gender)
  gioi_tinh?: Gender;

  @IsOptional()
  @IsEnum(ReaderStatus)
  trang_thai?: ReaderStatus;
}
