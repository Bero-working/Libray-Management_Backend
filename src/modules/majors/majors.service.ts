import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { mapPrismaError } from '../../common/errors/prisma-error.mapper';
import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { PrismaService } from '../../database/prisma.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';

@Injectable()
export class MajorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMajorDto) {
    try {
      const major = await this.prisma.major.create({
        data: {
          code: dto.ma_chuyen_nganh,
          name: dto.ten_chuyen_nganh,
          description: dto.mo_ta,
        },
      });

      return serializeJsonValue(major);
    } catch (error: unknown) {
      mapPrismaError(error, 'Major code already exists');
    }
  }

  async findAll() {
    const majors = await this.prisma.major.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return serializeJsonValue(majors);
  }

  async findOneByCode(code: string) {
    const major = await this.prisma.major.findFirst({
      where: { code, deletedAt: null },
    });

    if (!major) {
      throw new NotFoundException('Major not found');
    }

    return serializeJsonValue(major);
  }

  async update(code: string, dto: UpdateMajorDto) {
    await this.ensureExists(code);

    try {
      const major = await this.prisma.major.update({
        where: { code },
        data: {
          ...(dto.ten_chuyen_nganh && { name: dto.ten_chuyen_nganh }),
          ...(dto.mo_ta && { description: dto.mo_ta }),
        },
      });

      return serializeJsonValue(major);
    } catch (error: unknown) {
      mapPrismaError(error, 'Major update conflicts with existing data');
    }
  }

  async softDelete(code: string) {
    const major = await this.ensureExists(code);

    const hasActiveTitles = await this.prisma.bookTitle.findFirst({
      where: {
        majorId: major.id,
        deletedAt: null,
      },
    });

    if (hasActiveTitles) {
      throw new ConflictException({
        code: 'MAJOR_HAS_TITLES',
        message: 'Cannot delete major with active titles',
        details: { ma_chuyen_nganh: code },
      });
    }

    const deleted = await this.prisma.major.update({
      where: { code },
      data: { deletedAt: new Date() },
    });

    return serializeJsonValue(deleted);
  }

  private async ensureExists(code: string) {
    const major = await this.prisma.major.findFirst({
      where: { code, deletedAt: null },
    });

    if (!major) {
      throw new NotFoundException('Major not found');
    }

    return major;
  }
}
