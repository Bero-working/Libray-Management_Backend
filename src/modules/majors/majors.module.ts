import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { MajorsController } from './majors.controller';
import { MajorsService } from './majors.service';

@Module({
  imports: [PrismaModule],
  controllers: [MajorsController],
  providers: [MajorsService],
})
export class MajorsModule {}
