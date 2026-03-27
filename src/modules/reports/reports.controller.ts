import { AccountRole } from '@prisma/client';
import { Controller, Get, Query, Version } from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { TopBorrowedTitlesReportDto } from './dto/top-borrowed-titles-report.dto';
import { UnreturnedReadersReportDto } from './dto/unreturned-readers-report.dto';

@Controller('reports')
@Roles(AccountRole.LIBRARIAN, AccountRole.LEADER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('top-borrowed-titles')
  @Version('1')
  topBorrowedTitles(@Query() query: TopBorrowedTitlesReportDto) {
    return this.reportsService.getTopBorrowedTitles(query);
  }

  @Get('unreturned-readers')
  @Version('1')
  unreturnedReaders(@Query() query: UnreturnedReadersReportDto) {
    return this.reportsService.getUnreturnedReaders(query);
  }
}
