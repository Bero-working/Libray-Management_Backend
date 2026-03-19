import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports: [PrismaModule],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
