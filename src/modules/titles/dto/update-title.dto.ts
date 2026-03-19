import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTitleDto {
  @IsOptional()
  @IsString()
  ten_dau_sach?: string;

  @IsOptional()
  @IsString()
  nha_xuat_ban?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  so_trang?: number;

  @IsOptional()
  @IsString()
  kich_thuoc?: string;

  @IsOptional()
  @IsString()
  tac_gia?: string;

  @IsOptional()
  @IsString()
  ma_chuyen_nganh?: string;
}
