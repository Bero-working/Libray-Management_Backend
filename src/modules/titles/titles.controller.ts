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
  TitleEntityResponseDto,
  TitleViewResponseDto,
} from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { TitlesService } from './titles.service';

@ApiProtectedResource('Titles')
@Controller('titles')
@Roles(AccountRole.LIBRARIAN)
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @ApiOperation({ summary: 'List all active book titles' })
  @ApiSuccessResponse({
    description: 'Titles retrieved successfully',
    type: TitleViewResponseDto,
    isArray: true,
  })
  @Get()
  @Version('1')
  findAll() {
    return this.titlesService.findAll();
  }

  @ApiOperation({ summary: 'Get a book title by code' })
  @ApiSuccessResponse({
    description: 'Title retrieved successfully',
    type: TitleViewResponseDto,
  })
  @ApiNotFoundErrorResponse('Title not found')
  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.titlesService.findOneByCode(code);
  }

  @ApiOperation({ summary: 'Create a book title' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Title created successfully',
    type: TitleEntityResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Major not found')
  @ApiConflictErrorResponse('Title code already exists')
  @Post()
  @Version('1')
  create(@Body() dto: CreateTitleDto) {
    return this.titlesService.create(dto);
  }

  @ApiOperation({ summary: 'Update a book title' })
  @ApiSuccessResponse({
    description: 'Title updated successfully',
    type: TitleEntityResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Title or major not found')
  @ApiConflictErrorResponse('Title update conflicts with existing data')
  @Patch(':code')
  @Version('1')
  update(@Param('code') code: string, @Body() dto: UpdateTitleDto) {
    return this.titlesService.update(code, dto);
  }

  @ApiOperation({ summary: 'Soft-delete a book title' })
  @ApiSuccessResponse({
    description: 'Title removed successfully',
    type: TitleEntityResponseDto,
  })
  @ApiNotFoundErrorResponse('Title not found')
  @ApiConflictErrorResponse('Title has active copies or loans')
  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.titlesService.softDelete(code);
  }
}
