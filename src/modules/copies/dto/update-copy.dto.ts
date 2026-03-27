import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookCopyStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateCopyDto {
  @ApiPropertyOptional({
    enum: BookCopyStatus,
    example: BookCopyStatus.BORROWED,
    description: 'Updated copy status',
  })
  @IsOptional()
  @IsEnum(BookCopyStatus)
  tinh_trang?: BookCopyStatus;

  @ApiPropertyOptional({
    example: '2026-03-10',
    format: 'date',
    description: 'Updated acquisition date',
  })
  @IsOptional()
  @IsDateString()
  ngay_nhap?: string;
}
