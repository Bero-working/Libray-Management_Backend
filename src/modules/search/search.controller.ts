import { AccountRole } from '@prisma/client';
import { Controller, Get, Query, Version } from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { SearchBooksDto } from './dto/search-books.dto';
import { SearchService } from './search.service';

@Controller('search')
@Roles(AccountRole.LIBRARIAN, AccountRole.LEADER)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('books')
  @Version('1')
  findBooks(@Query() filters: SearchBooksDto) {
    return this.searchService.findBooks(filters);
  }
}
