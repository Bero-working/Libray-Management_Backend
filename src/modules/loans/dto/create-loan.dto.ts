import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  ma_doc_gia!: string;

  @IsString()
  ma_sach!: string;

  @IsOptional()
  @IsDateString()
  ngay_muon?: string;

  @IsOptional()
  @IsString()
  ghi_chu_tinh_trang?: string;
}
