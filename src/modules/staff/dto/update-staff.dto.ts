import { ApiPropertyOptional } from '@nestjs/swagger';
import { StaffStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van B',
    description: 'Updated full name of the staff member',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'nguyenvanb@example.com',
    description: 'Updated contact information',
  })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @ApiPropertyOptional({
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
    description: 'Updated staff status',
  })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;
}
