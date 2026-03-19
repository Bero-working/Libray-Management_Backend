import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { ReadersController } from './readers.controller';
import { ReadersPdfService } from './readers-pdf.service';
import { ReadersService } from './readers.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReadersController],
  providers: [ReadersService, ReadersPdfService],
})
export class ReadersModule {}
