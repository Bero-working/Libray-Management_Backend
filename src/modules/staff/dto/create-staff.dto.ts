import { ApiProperty } from '@nestjs/swagger';
import { StaffStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    example: 'NV001',
    description: 'Unique staff code',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Full name of the staff member',
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    example: 'nguyenvana@example.com',
    description: 'Contact information for the staff member',
  })
  @IsString()
  contactInfo!: string;

  @ApiProperty({
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
    description: 'Current staff status',
  })
  @IsEnum(StaffStatus)
  status!: StaffStatus;
}
