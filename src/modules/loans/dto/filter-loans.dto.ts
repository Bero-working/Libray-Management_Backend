import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    enum: LoanStatus,
    example: LoanStatus.BORROWED,
    description: 'Filter by loan status',
  })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiPropertyOptional({
    example: 'DG001',
    description: 'Filter by reader code',
  })
  @IsOptional()
  @IsString()
  ma_doc_gia?: string;

  @ApiPropertyOptional({
    example: 'S001',
    description: 'Filter by copy code',
  })
  @IsOptional()
  @IsString()
  ma_sach?: string;

  @ApiPropertyOptional({
    example: '2026-03-01',
    format: 'date',
    description: 'Loan date from',
  })
  @IsOptional()
  @IsDateString()
  ngay_muon_from?: string;

  @ApiPropertyOptional({
    example: '2026-03-31',
    format: 'date',
    description: 'Loan date to',
  })
  @IsOptional()
  @IsDateString()
  ngay_muon_to?: string;
}
