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
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { TitlesService } from './titles.service';

@Controller('titles')
@Roles(AccountRole.LIBRARIAN)
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Get()
  @Version('1')
  findAll() {
    return this.titlesService.findAll();
  }

  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.titlesService.findOneByCode(code);
  }

  @Post()
  @Version('1')
  create(@Body() dto: CreateTitleDto) {
    return this.titlesService.create(dto);
  }

  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() dto: UpdateTitleDto) {
    return this.titlesService.update(code, dto);
  }

  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.titlesService.softDelete(code);
  }
}
