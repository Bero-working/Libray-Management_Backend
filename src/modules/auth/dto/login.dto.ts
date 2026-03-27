import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin01',
    description: 'Username used to sign in',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: '12345678',
    minLength: 8,
    description: 'Account password',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
