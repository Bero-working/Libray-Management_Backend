import { Gender, ReaderStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateReaderDto {
  @IsString()
  ma_doc_gia!: string;

  @IsString()
  ho_ten!: string;

  @IsString()
  lop!: string;

  @IsDateString()
  ngay_sinh!: string;

  @IsEnum(Gender)
  gioi_tinh!: Gender;

  @IsEnum(ReaderStatus)
  trang_thai!: ReaderStatus;
}
