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
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { MajorsService } from './majors.service';

@Controller('majors')
@Roles(AccountRole.LIBRARIAN)
export class MajorsController {
  constructor(private readonly majorsService: MajorsService) {}

  @Get()
  @Version('1')
  findAll() {
    return this.majorsService.findAll();
  }

  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.majorsService.findOneByCode(code);
  }

  @Post()
  @Version('1')
  create(@Body() dto: CreateMajorDto) {
    return this.majorsService.create(dto);
  }

  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() dto: UpdateMajorDto) {
    return this.majorsService.update(code, dto);
  }

  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.majorsService.softDelete(code);
  }
}
