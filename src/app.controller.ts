import { Controller, Get, Version } from '@nestjs/common';
import { Public } from './modules/auth/decorators/public.decorator';
import type { HealthResponse } from './app.service';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @Version('1')
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
