import { LoanStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FilterLoansDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @IsOptional()
  @IsString()
  ma_doc_gia?: string;

  @IsOptional()
  @IsString()
  ma_sach?: string;

  @IsOptional()
  @IsDateString()
  ngay_muon_from?: string;

  @IsOptional()
  @IsDateString()
  ngay_muon_to?: string;
}
