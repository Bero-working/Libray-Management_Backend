import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateTitleDto {
  @ApiProperty({
    example: 'DS001',
    description: 'Unique book title code',
  })
  @IsString()
  ma_dau_sach!: string;

  @ApiProperty({
    example: 'Clean Code',
    description: 'Book title name',
  })
  @IsString()
  ten_dau_sach!: string;

  @ApiProperty({
    example: 'Prentice Hall',
    description: 'Publisher name',
  })
  @IsString()
  nha_xuat_ban!: string;

  @ApiProperty({
    example: 464,
    minimum: 1,
    description: 'Total page count',
  })
  @IsInt()
  @Min(1)
  so_trang!: number;

  @ApiProperty({
    example: '16 x 24 cm',
    description: 'Physical size of the book',
  })
  @IsString()
  kich_thuoc!: string;

  @ApiProperty({
    example: 'Robert C. Martin',
    description: 'Author name',
  })
  @IsString()
  tac_gia!: string;

  @ApiProperty({
    example: 'CNTT',
    description: 'Major code that this title belongs to',
  })
  @IsString()
  ma_chuyen_nganh!: string;
}
