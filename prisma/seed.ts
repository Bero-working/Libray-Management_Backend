import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AccountRole,
  AccountStatus,
  PrismaClient,
  StaffStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const runtimeDatabaseUrl = process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error('DATABASE_URL is required to run prisma seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: runtimeDatabaseUrl }),
});

type SeedAccountDefinition = {
  contactInfo: string;
  fullName: string;
  password: string;
  role: AccountRole;
  staffCode: string;
  username: string;
};

const getSeedAccountDefinitions = (): SeedAccountDefinition[] => {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const librarianPassword = process.env.SEED_LIBRARIAN_PASSWORD;
  const leaderPassword = process.env.SEED_LEADER_PASSWORD;

  if (!adminPassword || !librarianPassword || !leaderPassword) {
    throw new Error(
      'SEED_ADMIN_PASSWORD, SEED_LIBRARIAN_PASSWORD, and SEED_LEADER_PASSWORD are required for seeding accounts',
    );
  }

  return [
    {
      staffCode: 'NV_ADMIN_001',
      fullName: 'System Administrator',
      contactInfo: 'admin@library.local',
      username: 'admin',
      password: adminPassword,
      role: AccountRole.ADMIN,
    },
    {
      staffCode: 'NV_LIB_001',
      fullName: 'Library Librarian',
      contactInfo: 'librarian@library.local',
      username: 'librarian',
      password: librarianPassword,
      role: AccountRole.LIBRARIAN,
    },
    {
      staffCode: 'NV_LEADER_001',
      fullName: 'Library Leader',
      contactInfo: 'leader@library.local',
      username: 'leader',
      password: leaderPassword,
      role: AccountRole.LEADER,
    },
  ];
};

const seed = async (): Promise<void> => {
  const accounts = getSeedAccountDefinitions();

  for (const account of accounts) {
    await prisma.$transaction(async (transaction) => {
      const staff = await transaction.staff.upsert({
        where: {
          code: account.staffCode,
        },
        update: {
          contactInfo: account.contactInfo,
          deletedAt: null,
          fullName: account.fullName,
          status: StaffStatus.ACTIVE,
        },
        create: {
          code: account.staffCode,
          contactInfo: account.contactInfo,
          fullName: account.fullName,
          status: StaffStatus.ACTIVE,
        },
      });

      const passwordHash = await bcrypt.hash(account.password, 10);
      const existingAccountByStaff = await transaction.staffAccount.findFirst({
        where: {
          staffId: staff.id,
        },
      });

      if (existingAccountByStaff) {
        await transaction.staffAccount.update({
          where: {
            id: existingAccountByStaff.id,
          },
          data: {
            deletedAt: null,
            passwordHash,
            refreshTokenHash: null,
            role: account.role,
            status: AccountStatus.ACTIVE,
            username: account.username,
          },
        });

        return;
      }

      await transaction.staffAccount.upsert({
        where: {
          username: account.username,
        },
        update: {
          deletedAt: null,
          passwordHash,
          refreshTokenHash: null,
          role: account.role,
          staffId: staff.id,
          status: AccountStatus.ACTIVE,
        },
        create: {
          username: account.username,
          passwordHash,
          refreshTokenHash: null,
          role: account.role,
          staffId: staff.id,
          status: AccountStatus.ACTIVE,
        },
      });
    });
  }
};

void seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
