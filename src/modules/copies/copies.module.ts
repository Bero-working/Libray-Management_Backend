import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { CopiesController } from './copies.controller';
import { CopiesService } from './copies.service';

@Module({
  imports: [PrismaModule],
  controllers: [CopiesController],
  providers: [CopiesService],
})
export class CopiesModule {}
