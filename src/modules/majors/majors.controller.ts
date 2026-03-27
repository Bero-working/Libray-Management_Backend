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
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestErrorResponse,
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiProtectedResource,
  ApiSuccessResponse,
} from '../../common/swagger/swagger.decorators';
import { MajorResponseDto } from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { MajorsService } from './majors.service';

@ApiProtectedResource('Majors')
@Controller('majors')
@Roles(AccountRole.LIBRARIAN)
export class MajorsController {
  constructor(private readonly majorsService: MajorsService) {}

  @ApiOperation({ summary: 'List all active majors' })
  @ApiSuccessResponse({
    description: 'Majors retrieved successfully',
    type: MajorResponseDto,
    isArray: true,
  })
  @Get()
  @Version('1')
  findAll() {
    return this.majorsService.findAll();
  }

  @ApiOperation({ summary: 'Get a major by code' })
  @ApiSuccessResponse({
    description: 'Major retrieved successfully',
    type: MajorResponseDto,
  })
  @ApiNotFoundErrorResponse('Major not found')
  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.majorsService.findOneByCode(code);
  }

  @ApiOperation({ summary: 'Create a major' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Major created successfully',
    type: MajorResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiConflictErrorResponse('Major code already exists')
  @Post()
  @Version('1')
  create(@Body() dto: CreateMajorDto) {
    return this.majorsService.create(dto);
  }

  @ApiOperation({ summary: 'Update a major' })
  @ApiSuccessResponse({
    description: 'Major updated successfully',
    type: MajorResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Major not found')
  @ApiConflictErrorResponse('Major update conflicts with existing data')
  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() dto: UpdateMajorDto) {
    return this.majorsService.update(code, dto);
  }

  @ApiOperation({ summary: 'Soft-delete a major' })
  @ApiSuccessResponse({
    description: 'Major removed successfully',
    type: MajorResponseDto,
  })
  @ApiNotFoundErrorResponse('Major not found')
  @ApiConflictErrorResponse('Cannot delete major with active titles')
  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.majorsService.softDelete(code);
  }
}
