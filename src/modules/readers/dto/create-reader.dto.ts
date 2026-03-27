import { ApiProperty } from '@nestjs/swagger';
import { Gender, ReaderStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateReaderDto {
  @ApiProperty({
    example: 'DG001',
    description: 'Unique reader code',
  })
  @IsString()
  ma_doc_gia!: string;

  @ApiProperty({
    example: 'Tran Thi B',
    description: 'Reader full name',
  })
  @IsString()
  ho_ten!: string;

  @ApiProperty({
    example: 'CTK44A',
    description: 'Reader class name',
  })
  @IsString()
  lop!: string;

  @ApiProperty({
    example: '2004-09-12',
    format: 'date',
    description: 'Reader birth date',
  })
  @IsDateString()
  ngay_sinh!: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.FEMALE,
    description: 'Reader gender',
  })
  @IsEnum(Gender)
  gioi_tinh!: Gender;

  @ApiProperty({
    enum: ReaderStatus,
    example: ReaderStatus.ACTIVE,
    description: 'Reader status',
  })
  @IsEnum(ReaderStatus)
  trang_thai!: ReaderStatus;
}
