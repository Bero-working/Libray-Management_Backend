import { AccountRole } from '@prisma/client';
import { Controller, Get, Query, Version } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestErrorResponse,
  ApiProtectedResource,
  ApiSuccessResponse,
  buildPaginatedDataSchema,
} from '../../common/swagger/swagger.decorators';
import {
  DateRangePaginationMetaDto,
  PaginationMetaDto,
  TopBorrowedTitleItemDto,
  UnreturnedReaderItemDto,
} from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { TopBorrowedTitlesReportDto } from './dto/top-borrowed-titles-report.dto';
import { UnreturnedReadersReportDto } from './dto/unreturned-readers-report.dto';

@ApiProtectedResource('Reports')
@Controller('reports')
@Roles(AccountRole.LIBRARIAN, AccountRole.LEADER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get top borrowed titles report' })
  @ApiSuccessResponse({
    description: 'Top borrowed titles report retrieved successfully',
    schema: buildPaginatedDataSchema(
      TopBorrowedTitleItemDto,
      DateRangePaginationMetaDto,
    ),
    extraModels: [TopBorrowedTitleItemDto, DateRangePaginationMetaDto],
  })
  @ApiBadRequestErrorResponse()
  @Get('top-borrowed-titles')
  @Version('1')
  topBorrowedTitles(@Query() query: TopBorrowedTitlesReportDto) {
    return this.reportsService.getTopBorrowedTitles(query);
  }

  @ApiOperation({ summary: 'Get readers with unreturned books' })
  @ApiSuccessResponse({
    description: 'Unreturned readers report retrieved successfully',
    schema: buildPaginatedDataSchema(UnreturnedReaderItemDto),
    extraModels: [UnreturnedReaderItemDto, PaginationMetaDto],
  })
  @ApiBadRequestErrorResponse()
  @Get('unreturned-readers')
  @Version('1')
  unreturnedReaders(@Query() query: UnreturnedReadersReportDto) {
    return this.reportsService.getUnreturnedReaders(query);
  }
}
