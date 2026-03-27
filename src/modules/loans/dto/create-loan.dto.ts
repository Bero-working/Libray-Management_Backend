import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({
    example: 'DG001',
    description: 'Reader code borrowing the book',
  })
  @IsString()
  ma_doc_gia!: string;

  @ApiProperty({
    example: 'S001',
    description: 'Copy code being borrowed',
  })
  @IsString()
  ma_sach!: string;

  @ApiPropertyOptional({
    example: '2026-03-20',
    format: 'date',
    description: 'Loan date, defaults to current date if omitted',
  })
  @IsOptional()
  @IsDateString()
  ngay_muon?: string;

  @ApiPropertyOptional({
    example: 'Sach con moi',
    description: 'Optional note about the copy condition',
  })
  @IsOptional()
  @IsString()
  ghi_chu_tinh_trang?: string;
}
