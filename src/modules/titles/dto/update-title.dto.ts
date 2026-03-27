import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTitleDto {
  @ApiPropertyOptional({
    example: 'Clean Code 2nd Edition',
    description: 'Updated book title name',
  })
  @IsOptional()
  @IsString()
  ten_dau_sach?: string;

  @ApiPropertyOptional({
    example: 'Pearson',
    description: 'Updated publisher name',
  })
  @IsOptional()
  @IsString()
  nha_xuat_ban?: string;

  @ApiPropertyOptional({
    example: 500,
    minimum: 1,
    description: 'Updated page count',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  so_trang?: number;

  @ApiPropertyOptional({
    example: '17 x 24 cm',
    description: 'Updated book size',
  })
  @IsOptional()
  @IsString()
  kich_thuoc?: string;

  @ApiPropertyOptional({
    example: 'Robert Martin',
    description: 'Updated author name',
  })
  @IsOptional()
  @IsString()
  tac_gia?: string;

  @ApiPropertyOptional({
    example: 'CNTT',
    description: 'Updated major code',
  })
  @IsOptional()
  @IsString()
  ma_chuyen_nganh?: string;
}
