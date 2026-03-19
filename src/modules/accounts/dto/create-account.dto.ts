import { AccountRole, AccountStatus } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(AccountRole)
  role!: AccountRole;

  @IsString()
  staffCode!: string;

  @IsEnum(AccountStatus)
  status!: AccountStatus;
}
