import { AccountRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  Version,
} from '@nestjs/common';
import type { Response } from 'express';

import { Roles } from '../auth/decorators/roles.decorator';
import { ReadersPdfService } from './readers-pdf.service';
import { ReadersService } from './readers.service';
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';

@Controller('readers')
@Roles(AccountRole.LIBRARIAN)
export class ReadersController {
  constructor(
    private readonly readersService: ReadersService,
    private readonly readersPdfService: ReadersPdfService,
  ) {}

  @Get()
  @Version('1')
  findAll() {
    return this.readersService.findAll();
  }

  @Get(':code')
  @Version('1')
  findOne(@Param('code') code: string) {
    return this.readersService.findOneByCode(code);
  }

  @Post()
  @Version('1')
  create(@Body() createReaderDto: CreateReaderDto) {
    return this.readersService.create(createReaderDto);
  }

  @Patch(':code')
  @Version('1')
  update(
    @Param('code') code: string,
    @Body() updateReaderDto: UpdateReaderDto,
  ) {
    return this.readersService.update(code, updateReaderDto);
  }

  @Delete(':code')
  @Version('1')
  remove(@Param('code') code: string) {
    return this.readersService.softDelete(code);
  }

  @Post(':code/print-card')
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
