import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookCopyStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class ReturnLoanDto {
  @ApiPropertyOptional({
    example: '2026-03-27',
    format: 'date',
    description: 'Return date, defaults to current date if omitted',
  })
  @IsOptional()
  @IsDateString()
  ngay_tra?: string;

  @ApiProperty({
    enum: BookCopyStatus,
    example: BookCopyStatus.AVAILABLE,
    description: 'Copy status after return',
  })
  @IsEnum(BookCopyStatus)
  tinh_trang_sau_tra!: BookCopyStatus;

  @ApiPropertyOptional({
    example: 'Bia sach co vet xuoc nhe',
    description: 'Optional note about the returned copy condition',
  })
  @IsOptional()
  @IsString()
  ghi_chu_tinh_trang?: string;
}
