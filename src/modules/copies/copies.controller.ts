import { AccountRole } from '@prisma/client';
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

import { Roles } from '../auth/decorators/roles.decorator';
import { CopiesService } from './copies.service';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';

@Controller('copies')
@Roles(AccountRole.LIBRARIAN)
export class CopiesController {
  constructor(private readonly copiesService: CopiesService) {}

  @Get()
  @Version('1')
  findAll() {
    return this.copiesService.findAll();
  }

  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.copiesService.findOneByCode(code);
  }

  @Post()
  @Version('1')
  create(@Body() dto: CreateCopyDto) {
    return this.copiesService.create(dto);
  }

  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() dto: UpdateCopyDto) {
    return this.copiesService.update(code, dto);
  }

  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.copiesService.softDelete(code);
  }
}
