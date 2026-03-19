import { AccountRole } from '@prisma/client';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateLoanDto } from './dto/create-loan.dto';
import { FilterLoansDto } from './dto/filter-loans.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';
import { LoansService } from './loans.service';

@Controller('loans')
@Roles(AccountRole.LIBRARIAN)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  @Version('1')
  findAll(@Query() filters: FilterLoansDto) {
    return this.loansService.findAll(filters);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.loansService.findOneById(id);
  }

  @Post()
  @Version('1')
  create(@Body() dto: CreateLoanDto, @CurrentUser() user: AuthenticatedUser) {
    return this.loansService.create(dto, user);
  }

  @Patch(':id/return')
  @Version('1')
  returnLoan(@Param('id') id: string, @Body() dto: ReturnLoanDto) {
    return this.loansService.returnLoan(id, dto);
  }
}
