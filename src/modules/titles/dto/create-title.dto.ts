import { IsInt, IsString, Min } from 'class-validator';

export class CreateTitleDto {
  @IsString()
  ma_dau_sach!: string;

  @IsString()
  ten_dau_sach!: string;

  @IsString()
  nha_xuat_ban!: string;

  @IsInt()
  @Min(1)
  so_trang!: number;

  @IsString()
  kich_thuoc!: string;

  @IsString()
  tac_gia!: string;

  @IsString()
  ma_chuyen_nganh!: string;
}
