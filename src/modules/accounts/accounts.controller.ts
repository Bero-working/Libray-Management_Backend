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
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@Roles(AccountRole.ADMIN)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Version('1')
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':username')
  @Version('1')
  findOne(@Param('username') username: string) {
    return this.accountsService.findOne(username);
  }

  @Patch(':username')
  @Version('1')
  update(
    @Param('username') username: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(username, updateAccountDto);
  }

  @Delete(':username')
  @Version('1')
  remove(@Param('username') username: string) {
    return this.accountsService.remove(username);
  }
}
