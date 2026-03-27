import { Body, Controller, HttpCode, Post, Version } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestErrorResponse,
  ApiForbiddenErrorResponse,
  ApiSuccessResponse,
  ApiTooManyRequestsErrorResponse,
  ApiUnauthorizedErrorResponse,
} from '../../common/swagger/swagger.decorators';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokensResponseDto,
} from '../../common/swagger/swagger.models';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Login and receive access/refresh tokens' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiUnauthorizedErrorResponse('Invalid credentials')
  @ApiForbiddenErrorResponse('Account is inactive')
  @ApiTooManyRequestsErrorResponse('Too many login attempts')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @Version('1')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Public()
  @ApiOperation({ summary: 'Refresh tokens using a valid refresh token' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: RefreshTokensResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiUnauthorizedErrorResponse('Refresh token is invalid')
  @ApiForbiddenErrorResponse('Account is inactive')
  @ApiTooManyRequestsErrorResponse('Too many refresh attempts')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  @Version('1')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Public()
  @ApiOperation({ summary: 'Logout and revoke the current refresh token' })
  @ApiSuccessResponse({
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiUnauthorizedErrorResponse('Refresh token is invalid')
  @ApiForbiddenErrorResponse('Account is inactive')
  @ApiTooManyRequestsErrorResponse('Too many logout attempts')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('logout')
  @HttpCode(200)
  @Version('1')
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto.refreshToken);

    return {
      message: 'Logged out successfully',
    };
  }
}
