import { StaffStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  code!: string;

  @IsString()
  fullName!: string;

  @IsString()
  contactInfo!: string;

  @IsEnum(StaffStatus)
  status!: StaffStatus;
}
