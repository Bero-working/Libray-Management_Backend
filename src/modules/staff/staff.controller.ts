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
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';

@Controller('staff')
@Roles(AccountRole.ADMIN)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Version('1')
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.staffService.findOne(code);
  }

  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(code, updateStaffDto);
  }

  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.staffService.remove(code);
  }
}
