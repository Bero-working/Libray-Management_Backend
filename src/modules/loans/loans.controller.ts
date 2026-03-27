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
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestErrorResponse,
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiProtectedResource,
  ApiSuccessResponse,
  buildPaginatedDataSchema,
} from '../../common/swagger/swagger.decorators';
import {
  LoanViewResponseDto,
  PaginationMetaDto,
} from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateLoanDto } from './dto/create-loan.dto';
import { FilterLoansDto } from './dto/filter-loans.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';
import { LoansService } from './loans.service';

@ApiProtectedResource('Loans')
@Controller('loans')
@Roles(AccountRole.LIBRARIAN)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @ApiOperation({ summary: 'List loans with filters and pagination' })
  @ApiSuccessResponse({
    description: 'Loans retrieved successfully',
    schema: buildPaginatedDataSchema(LoanViewResponseDto),
    extraModels: [LoanViewResponseDto, PaginationMetaDto],
  })
  @ApiBadRequestErrorResponse()
  @Get()
  @Version('1')
  findAll(@Query() filters: FilterLoansDto) {
    return this.loansService.findAll(filters);
  }

  @ApiOperation({ summary: 'Get a loan by id' })
  @ApiSuccessResponse({
    description: 'Loan retrieved successfully',
    type: LoanViewResponseDto,
  })
  @ApiNotFoundErrorResponse('Loan not found')
  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.loansService.findOneById(id);
  }

  @ApiOperation({ summary: 'Create a loan' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Loan created successfully',
    type: LoanViewResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Reader or copy not found')
  @ApiConflictErrorResponse(
    'Loan creation conflicts with current business rules',
  )
  @Post()
  @Version('1')
  create(@Body() dto: CreateLoanDto, @CurrentUser() user: AuthenticatedUser) {
    return this.loansService.create(dto, user);
  }

  @ApiOperation({ summary: 'Return a loan and update copy status' })
  @ApiSuccessResponse({
    description: 'Loan returned successfully',
    type: LoanViewResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Loan not found')
  @ApiConflictErrorResponse('Loan has already been returned')
  @Patch(':id/return')
  @Version('1')
  returnLoan(@Param('id') id: string, @Body() dto: ReturnLoanDto) {
    return this.loansService.returnLoan(id, dto);
  }
}
