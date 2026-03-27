import { AccountRole, AccountStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    enum: AccountRole,
    example: AccountRole.LIBRARIAN,
    description: 'Updated role for the account',
  })
  @IsOptional()
  @IsEnum(AccountRole)
  role?: AccountRole;

  @ApiPropertyOptional({
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
    description: 'Updated status for the account',
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({
    example: 'newpassword123',
    minLength: 8,
    description: 'New password for the account',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
