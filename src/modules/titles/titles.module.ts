import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { TitlesController } from './titles.controller';
import { TitlesService } from './titles.service';

@Module({
  imports: [PrismaModule],
  controllers: [TitlesController],
  providers: [TitlesService],
})
export class TitlesModule {}
