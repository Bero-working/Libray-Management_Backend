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
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBadRequestErrorResponse,
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiProtectedResource,
  ApiSuccessResponse,
} from '../../common/swagger/swagger.decorators';
import { StaffResponseDto } from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';

@ApiProtectedResource('Staff')
@Controller('staff')
@Roles(AccountRole.ADMIN)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @ApiOperation({ summary: 'Create a staff member' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Staff created successfully',
    type: StaffResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiConflictErrorResponse('Staff code already exists')
  @Post()
  @Version('1')
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @ApiOperation({ summary: 'List all active staff members' })
  @ApiSuccessResponse({
    description: 'Staff retrieved successfully',
    type: StaffResponseDto,
    isArray: true,
  })
  @Get()
  @Version('1')
  findAll() {
    return this.staffService.findAll();
  }

  @ApiOperation({ summary: 'Get a staff member by code' })
  @ApiSuccessResponse({
    description: 'Staff retrieved successfully',
    type: StaffResponseDto,
  })
  @ApiNotFoundErrorResponse('Staff not found')
  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.staffService.findOne(code);
  }

  @ApiOperation({ summary: 'Update a staff member' })
  @ApiSuccessResponse({
    description: 'Staff updated successfully',
    type: StaffResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Staff not found')
  @ApiConflictErrorResponse('Staff update conflicts with existing data')
  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(code, updateStaffDto);
  }

  @ApiOperation({ summary: 'Soft-delete a staff member' })
  @ApiSuccessResponse({
    description: 'Staff removed successfully',
    type: StaffResponseDto,
  })
  @ApiNotFoundErrorResponse('Staff not found')
  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.staffService.remove(code);
  }
}
