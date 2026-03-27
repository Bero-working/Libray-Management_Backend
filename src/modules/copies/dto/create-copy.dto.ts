import { ApiProperty } from '@nestjs/swagger';
import { BookCopyStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateCopyDto {
  @ApiProperty({
    example: 'S001',
    description: 'Unique copy code',
  })
  @IsString()
  ma_sach!: string;

  @ApiProperty({
    example: 'DS001',
    description: 'Book title code that owns this copy',
  })
  @IsString()
  ma_dau_sach!: string;

  @ApiProperty({
    enum: BookCopyStatus,
    example: BookCopyStatus.AVAILABLE,
    description: 'Current copy status',
  })
  @IsEnum(BookCopyStatus)
  tinh_trang!: BookCopyStatus;

  @ApiProperty({
    example: '2026-03-10',
    format: 'date',
    description: 'Acquisition date',
  })
  @IsDateString()
  ngay_nhap!: string;
}
