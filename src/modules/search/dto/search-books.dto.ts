import { BookCopyStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchBooksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  ma_dau_sach?: string;

  @IsOptional()
  @IsString()
  ten_dau_sach?: string;

  @IsOptional()
  @IsString()
  tac_gia?: string;

  @IsOptional()
  @IsString()
  ma_chuyen_nganh?: string;

  @IsOptional()
  @IsString()
  ma_sach?: string;

  @IsOptional()
  @IsEnum(BookCopyStatus)
  tinh_trang?: BookCopyStatus;
}
