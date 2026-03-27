import { AccountRole, AccountStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: 'librarian01',
    description: 'Unique username used to sign in',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: '12345678',
    minLength: 8,
    description: 'Plain text password with at least 8 characters',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    enum: AccountRole,
    example: AccountRole.LIBRARIAN,
    description: 'Role assigned to the account',
  })
  @IsEnum(AccountRole)
  role!: AccountRole;

  @ApiProperty({
    example: 'NV001',
    description: 'Staff code linked to this account',
  })
  @IsString()
  staffCode!: string;

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
    description: 'Current account status',
  })
  @IsEnum(AccountStatus)
  status!: AccountStatus;
}
