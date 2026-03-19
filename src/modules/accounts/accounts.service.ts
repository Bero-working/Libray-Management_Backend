import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';
import { PrismaService } from '../../database/prisma.service';
import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAccountDto: CreateAccountDto) {
    const passwordHash = await bcrypt.hash(createAccountDto.password, 10);
    const staff = await this.prismaService.staff.findFirst({
      where: {
        code: createAccountDto.staffCode,
        deletedAt: null,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    try {
      const account = await this.prismaService.staffAccount.create({
        data: {
          username: createAccountDto.username,
          passwordHash,
          role: createAccountDto.role,
          staffId: staff.id,
          status: createAccountDto.status,
        },
        include: {
          staff: true,
        },
      });

      return serializeJsonValue(this.toResponse(account));
    } catch (error) {
      mapPrismaError(
        error,
        'Account already exists or staff already has an account',
      );
    }
  }

  async findAll() {
    const accounts = await this.prismaService.staffAccount.findMany({
      where: { deletedAt: null },
      include: {
        staff: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return serializeJsonValue(
      accounts.map((account) => this.toResponse(account)),
    );
  }

  async findOne(username: string) {
    const account = await this.prismaService.staffAccount.findFirst({
      where: { username, deletedAt: null },
      include: {
        staff: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return serializeJsonValue(this.toResponse(account));
  }

  async update(username: string, updateAccountDto: UpdateAccountDto) {
    await this.findOne(username);

    try {
      const account = await this.prismaService.staffAccount.update({
        where: { username },
        data: {
          role: updateAccountDto.role,
          status: updateAccountDto.status,
          ...(updateAccountDto.newPassword
            ? {
                passwordHash: await bcrypt.hash(
                  updateAccountDto.newPassword,
                  10,
                ),
              }
            : {}),
        },
        include: {
          staff: true,
        },
      });

      return serializeJsonValue(this.toResponse(account));
    } catch (error) {
      mapPrismaError(error, 'Account update conflicts with existing data');
    }
  }

  async remove(username: string) {
    await this.findOne(username);

    const account = await this.prismaService.staffAccount.update({
      where: { username },
      data: { deletedAt: new Date(), refreshTokenHash: null },
      include: {
        staff: true,
      },
    });

    return serializeJsonValue(this.toResponse(account));
  }

  private toResponse(account: {
    id: bigint;
    username: string;
    role: string;
    status: string;
    staffId: bigint;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    staff: {
      id: bigint;
      code: string;
      fullName: string;
      contactInfo: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    };
  }) {
    return {
      id: account.id,
      username: account.username,
      role: account.role,
      status: account.status,
      staffId: account.staffId,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      deletedAt: account.deletedAt,
      staff: account.staff,
    };
  }
}
