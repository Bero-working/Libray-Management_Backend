import { Controller, Get, Version } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from './common/swagger/swagger.decorators';
import { HealthResponseDto } from './common/swagger/swagger.models';
import { Public } from './modules/auth/decorators/public.decorator';
import type { HealthResponse } from './app.service';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiSuccessResponse({
    description: 'Health status retrieved successfully',
    type: HealthResponseDto,
  })
  @Version('1')
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
