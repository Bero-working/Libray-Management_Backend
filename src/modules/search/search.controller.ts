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
  PaginationMetaDto,
  SearchBookResultDto,
} from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { SearchBooksDto } from './dto/search-books.dto';
import { SearchService } from './search.service';

@ApiProtectedResource('Search')
@Controller('search')
@Roles(AccountRole.LIBRARIAN, AccountRole.LEADER)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: 'Search books with title and copy filters' })
  @ApiSuccessResponse({
    description: 'Search results retrieved successfully',
    schema: buildPaginatedDataSchema(SearchBookResultDto),
    extraModels: [SearchBookResultDto, PaginationMetaDto],
  })
  @ApiBadRequestErrorResponse()
  @Get('books')
  @Version('1')
  findBooks(@Query() filters: SearchBooksDto) {
    return this.searchService.findBooks(filters);
  }
}
