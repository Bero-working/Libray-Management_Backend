import { IsOptional, IsString } from 'class-validator';

export class UpdateMajorDto {
  @IsOptional()
  @IsString()
  ten_chuyen_nganh?: string;

  @IsOptional()
  @IsString()
  mo_ta?: string;
}
