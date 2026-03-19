import { IsOptional, IsString } from 'class-validator';

export class CreateMajorDto {
  @IsString()
  ma_chuyen_nganh!: string;

  @IsString()
  ten_chuyen_nganh!: string;

  @IsOptional()
  @IsString()
  mo_ta?: string;
}
