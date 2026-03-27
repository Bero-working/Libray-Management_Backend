import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateMajorDto {
  @ApiProperty({
    example: 'CNTT',
    description: 'Unique major code',
  })
  @IsString()
  ma_chuyen_nganh!: string;

  @ApiProperty({
    example: 'Cong nghe thong tin',
    description: 'Major name',
  })
  @IsString()
  ten_chuyen_nganh!: string;

  @ApiPropertyOptional({
    example: 'Chuyen nganh ve phan mem va he thong thong tin',
    description: 'Optional major description',
  })
  @IsOptional()
  @IsString()
  mo_ta?: string;
}
