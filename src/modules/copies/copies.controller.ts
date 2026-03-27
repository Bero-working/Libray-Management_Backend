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
import {
  CopyEntityResponseDto,
  CopyViewResponseDto,
} from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { CopiesService } from './copies.service';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';

@ApiProtectedResource('Copies')
@Controller('copies')
@Roles(AccountRole.LIBRARIAN)
export class CopiesController {
  constructor(private readonly copiesService: CopiesService) {}

  @ApiOperation({ summary: 'List all active book copies' })
  @ApiSuccessResponse({
    description: 'Copies retrieved successfully',
    type: CopyViewResponseDto,
    isArray: true,
  })
  @Get()
  @Version('1')
  findAll() {
    return this.copiesService.findAll();
  }

  @ApiOperation({ summary: 'Get a book copy by code' })
  @ApiSuccessResponse({
    description: 'Copy retrieved successfully',
    type: CopyViewResponseDto,
  })
  @ApiNotFoundErrorResponse('Copy not found')
  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.copiesService.findOneByCode(code);
  }

  @ApiOperation({ summary: 'Create a book copy' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Copy created successfully',
    type: CopyEntityResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Title not found')
  @ApiConflictErrorResponse('Copy code already exists')
  @Post()
  @Version('1')
  create(@Body() dto: CreateCopyDto) {
    return this.copiesService.create(dto);
  }

  @ApiOperation({ summary: 'Update a book copy' })
  @ApiSuccessResponse({
    description: 'Copy updated successfully',
    type: CopyEntityResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Copy not found')
  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() dto: UpdateCopyDto) {
    return this.copiesService.update(code, dto);
  }

  @ApiOperation({ summary: 'Soft-delete a book copy' })
  @ApiSuccessResponse({
    description: 'Copy removed successfully',
    type: CopyEntityResponseDto,
  })
  @ApiNotFoundErrorResponse('Copy not found')
  @ApiConflictErrorResponse('Copy has active or pending loans')
  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.copiesService.softDelete(code);
  }
}
