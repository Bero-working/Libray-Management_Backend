import { AccountRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';

import {
  ApiBadRequestErrorResponse,
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiProtectedResource,
  ApiSuccessResponse,
} from '../../common/swagger/swagger.decorators';
import { ReaderResponseDto } from '../../common/swagger/swagger.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReadersPdfService } from './readers-pdf.service';
import { ReadersService } from './readers.service';
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';

@ApiProtectedResource('Readers')
@Controller('readers')
@Roles(AccountRole.LIBRARIAN)
export class ReadersController {
  constructor(
    private readonly readersService: ReadersService,
    private readonly readersPdfService: ReadersPdfService,
  ) {}

  @ApiOperation({ summary: 'List all active readers' })
  @ApiSuccessResponse({
    description: 'Readers retrieved successfully',
    type: ReaderResponseDto,
    isArray: true,
  })
  @Get()
  @Version('1')
  findAll() {
    return this.readersService.findAll();
  }

  @ApiOperation({ summary: 'Get a reader by code' })
  @ApiSuccessResponse({
    description: 'Reader retrieved successfully',
    type: ReaderResponseDto,
  })
  @ApiNotFoundErrorResponse('Reader not found')
  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.readersService.findOneByCode(code);
  }

  @ApiOperation({ summary: 'Create a reader' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Reader created successfully',
    type: ReaderResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiConflictErrorResponse('Reader code already exists')
  @Post()
  @Version('1')
  create(@Body() createReaderDto: CreateReaderDto) {
    return this.readersService.create(createReaderDto);
  }

  @ApiOperation({ summary: 'Update a reader' })
  @ApiSuccessResponse({
    description: 'Reader updated successfully',
    type: ReaderResponseDto,
  })
  @ApiBadRequestErrorResponse()
  @ApiNotFoundErrorResponse('Reader not found')
  @Patch(':code')
  @Version('1')
  update(
    @Param('code') code: string,
    @Body() updateReaderDto: UpdateReaderDto,
  ) {
    return this.readersService.update(code, updateReaderDto);
  }

  @ApiOperation({ summary: 'Soft-delete a reader' })
  @ApiSuccessResponse({
    description: 'Reader removed successfully',
    type: ReaderResponseDto,
  })
  @ApiNotFoundErrorResponse('Reader not found')
  @ApiConflictErrorResponse('Reader has unreturned loan')
  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.readersService.softDelete(code);
  }

  @ApiOperation({ summary: 'Generate a reader card PDF' })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'Reader card generated successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiNotFoundErrorResponse('Reader not found')
  @Post(':code/print-card')
  @HttpCode(200)
  @Version('1')
  async printCard(
    @Param('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const payload = await this.readersService.getCardPayload(code);
    const buffer = await this.readersPdfService.generateCard({
      code: payload.code,
      fullName: payload.fullName,
      className: payload.className,
      status: payload.status,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="library-card-${payload.code}.pdf"`,
    );

    return new StreamableFile(buffer);
  }
}
