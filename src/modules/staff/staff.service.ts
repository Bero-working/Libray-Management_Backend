import { Injectable, NotFoundException } from '@nestjs/common';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';
import { PrismaService } from '../../database/prisma.service';
import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createStaffDto: CreateStaffDto) {
    try {
      const staff = await this.prismaService.staff.create({
        data: createStaffDto,
      });

      return serializeJsonValue(staff);
    } catch (error) {
      mapPrismaError(error, 'Staff code already exists');
    }
  }

  async findAll() {
    const staff = await this.prismaService.staff.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return serializeJsonValue(staff);
  }

  async findOne(code: string) {
    const staff = await this.prismaService.staff.findFirst({
      where: { code, deletedAt: null },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return serializeJsonValue(staff);
  }

  async update(code: string, updateStaffDto: UpdateStaffDto) {
    await this.findOne(code);

    try {
      const staff = await this.prismaService.staff.update({
        where: { code },
        data: updateStaffDto,
      });

      return serializeJsonValue(staff);
    } catch (error) {
      mapPrismaError(error, 'Staff update conflicts with existing data');
    }
  }

  async remove(code: string) {
    await this.findOne(code);

    const staff = await this.prismaService.staff.update({
      where: { code },
      data: { deletedAt: new Date() },
    });

    return serializeJsonValue(staff);
  }
}
