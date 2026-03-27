import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookCopyStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchBooksDto {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: 1000,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
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
    example: 'DS001',
    description: 'Filter by book title code',
  })
  @IsOptional()
  @IsString()
  ma_dau_sach?: string;

  @ApiPropertyOptional({
    example: 'Clean Code',
    description: 'Filter by book title name',
  })
  @IsOptional()
  @IsString()
  ten_dau_sach?: string;

  @ApiPropertyOptional({
    example: 'Robert Martin',
    description: 'Filter by author name',
  })
  @IsOptional()
  @IsString()
  tac_gia?: string;

  @ApiPropertyOptional({
    example: 'CNTT',
    description: 'Filter by major code',
  })
  @IsOptional()
  @IsString()
  ma_chuyen_nganh?: string;

  @ApiPropertyOptional({
    example: 'S001',
    description: 'Filter by copy code',
  })
  @IsOptional()
  @IsString()
  ma_sach?: string;

  @ApiPropertyOptional({
    enum: BookCopyStatus,
    example: BookCopyStatus.AVAILABLE,
    description: 'Filter by copy status',
  })
  @IsOptional()
  @IsEnum(BookCopyStatus)
  tinh_trang?: BookCopyStatus;
}
