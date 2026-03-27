import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { AccountRole } from '@prisma/client';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import {
  ApiBadRequestErrorResponse,
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiProtectedResource,
  ApiSuccessResponse,
} from '../../common/swagger/swagger.decorators';
import { AccountResponseDto } from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiProtectedResource('Accounts')
@Controller('accounts')
@Roles(AccountRole.ADMIN)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({ summary: 'Create a staff account' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Account created successfully',
    type: AccountResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Staff not found')
  @ApiConflictErrorResponse('Account already exists or archived data conflicts')
  @Post()
  @Version('1')
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @ApiOperation({ summary: 'List all active accounts' })
  @ApiSuccessResponse({
    description: 'Accounts retrieved successfully',
    type: AccountResponseDto,
    isArray: true,
  })
  @Get()
  @Version('1')
  findAll() {
    return this.accountsService.findAll();
  }

  @ApiOperation({ summary: 'Get an account by username' })
  @ApiParam({
    name: 'username',
    description: 'Unique username of the account',
    example: 'librarian01',
  })
  @ApiSuccessResponse({
    description: 'Account retrieved successfully',
    type: AccountResponseDto,
  })
  @ApiNotFoundErrorResponse('Account not found')
  @Get(':username')
  @Version('1')
  findOne(@Param('username') username: string) {
    return this.accountsService.findOne(username);
  }

  @ApiOperation({ summary: 'Update an account role, status, or password' })
  @ApiParam({
    name: 'username',
    description: 'Unique username of the account',
    example: 'librarian01',
  })
  @ApiSuccessResponse({
    description: 'Account updated successfully',
    type: AccountResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Account not found')
  @ApiConflictErrorResponse('Account update conflicts with existing data')
  @Patch(':username')
  @Version('1')
  update(
    @Param('username') username: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(username, updateAccountDto);
  }

  @ApiOperation({ summary: 'Soft-delete an account' })
  @ApiParam({
    name: 'username',
    description: 'Unique username of the account',
    example: 'librarian01',
  })
  @ApiSuccessResponse({
    description: 'Account removed successfully',
    type: AccountResponseDto,
  })
  @ApiNotFoundErrorResponse('Account not found')
  @Delete(':username')
  @Version('1')
  remove(@Param('username') username: string) {
    return this.accountsService.remove(username);
  }
}
