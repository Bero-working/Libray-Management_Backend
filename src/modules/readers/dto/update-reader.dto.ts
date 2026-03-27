import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, ReaderStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateReaderDto {
  @ApiPropertyOptional({
    example: 'Tran Thi C',
    description: 'Updated reader full name',
  })
  @IsOptional()
  @IsString()
  ho_ten?: string;

  @ApiPropertyOptional({
    example: 'CTK44B',
    description: 'Updated class name',
  })
  @IsOptional()
  @IsString()
  lop?: string;

  @ApiPropertyOptional({
    example: '2004-09-12',
    format: 'date',
    description: 'Updated birth date',
  })
  @IsOptional()
  @IsDateString()
  ngay_sinh?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.FEMALE,
    description: 'Updated gender',
  })
  @IsOptional()
  @IsEnum(Gender)
  gioi_tinh?: Gender;

  @ApiPropertyOptional({
    enum: ReaderStatus,
    example: ReaderStatus.ACTIVE,
    description: 'Updated reader status',
  })
  @IsOptional()
  @IsEnum(ReaderStatus)
  trang_thai?: ReaderStatus;
}
