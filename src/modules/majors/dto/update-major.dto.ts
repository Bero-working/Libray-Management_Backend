import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMajorDto {
  @ApiPropertyOptional({
    example: 'Cong nghe thong tin ung dung',
    description: 'Updated major name',
  })
  @IsOptional()
  @IsString()
  ten_chuyen_nganh?: string;

  @ApiPropertyOptional({
    example: 'Cap nhat mo ta chuyen nganh',
    description: 'Updated major description',
  })
  @IsOptional()
  @IsString()
  mo_ta?: string;
}
