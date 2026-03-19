import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  BookCopyStatus,
  Gender,
  PrismaClient,
  ReaderStatus,
} from '@prisma/client';

const runtimeDatabaseUrl = process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error('DATABASE_URL is required to run phase 3 prisma seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: runtimeDatabaseUrl }),
});

type SeedMajor = {
  code: string;
  name: string;
  description?: string | null;
};

type SeedTitle = {
  code: string;
  name: string;
  publisher: string;
  pageCount: number;
  size: string;
  author: string;
  majorCode: string;
};

type SeedCopy = {
  code: string;
  bookTitleCode: string;
  status: BookCopyStatus;
  acquiredAt: Date;
};

type SeedReader = {
  code: string;
  fullName: string;
  className: string;
  birthDate: Date;
  gender: Gender;
  status: ReaderStatus;
};

const majors: SeedMajor[] = [
  {
    code: 'CN_CNTT',
    name: 'Cong nghe thong tin',
    description: 'Chuyen nganh CNTT',
  },
  {
    code: 'CN_KT',
    name: 'Kinh te',
    description: 'Chuyen nganh Kinh te',
  },
];

const titles: SeedTitle[] = [
  {
    code: 'DS_CSDL',
    name: 'Co so du lieu',
    publisher: 'NXB Giao Duc',
    pageCount: 320,
    size: '16x24',
    author: 'Le B',
    majorCode: 'CN_CNTT',
  },
  {
    code: 'DS_CTDL',
    name: 'Cau truc du lieu va giai thuat',
    publisher: 'NXB Giao Duc',
    pageCount: 280,
    size: '16x24',
    author: 'Nguyen C',
    majorCode: 'CN_CNTT',
  },
  {
    code: 'DS_KTVD',
    name: 'Kinh te vi mo',
    publisher: 'NXB Kinh Te',
    pageCount: 250,
    size: '16x24',
    author: 'Tran D',
    majorCode: 'CN_KT',
  },
];

const copies: SeedCopy[] = [
  {
    code: 'S_CSDL_001',
    bookTitleCode: 'DS_CSDL',
    status: BookCopyStatus.AVAILABLE,
    acquiredAt: new Date('2026-03-01'),
  },
  {
    code: 'S_CSDL_002',
    bookTitleCode: 'DS_CSDL',
    status: BookCopyStatus.AVAILABLE,
    acquiredAt: new Date('2026-03-01'),
  },
  {
    code: 'S_CTDL_001',
    bookTitleCode: 'DS_CTDL',
    status: BookCopyStatus.AVAILABLE,
    acquiredAt: new Date('2026-03-02'),
  },
  {
    code: 'S_KTVD_001',
    bookTitleCode: 'DS_KTVD',
    status: BookCopyStatus.AVAILABLE,
    acquiredAt: new Date('2026-03-03'),
  },
];

const readers: SeedReader[] = [
  {
    code: 'DG001',
    fullName: 'Nguyen Van A',
    className: 'CNTT-K18',
    birthDate: new Date('2004-09-10'),
    gender: Gender.MALE,
    status: ReaderStatus.ACTIVE,
  },
  {
    code: 'DG002',
    fullName: 'Tran Thi B',
    className: 'KT-K19',
    birthDate: new Date('2005-01-15'),
    gender: Gender.FEMALE,
    status: ReaderStatus.ACTIVE,
  },
];

const seedPhase3 = async (): Promise<void> => {
  // Seed majors
  for (const major of majors) {
    await prisma.major.upsert({
      where: { code: major.code },
      update: {
        name: major.name,
        description: major.description ?? null,
        deletedAt: null,
      },
      create: {
        code: major.code,
        name: major.name,
        description: major.description ?? null,
      },
    });
  }

  // Seed titles
  for (const title of titles) {
    const major = await prisma.major.findFirst({
      where: { code: title.majorCode, deletedAt: null },
    });

    if (!major) {
      throw new Error(`Major with code ${title.majorCode} not found for title ${title.code}`);
    }

    await prisma.bookTitle.upsert({
      where: { code: title.code },
      update: {
        name: title.name,
        publisher: title.publisher,
        pageCount: title.pageCount,
        size: title.size,
        author: title.author,
        majorId: major.id,
        deletedAt: null,
      },
      create: {
        code: title.code,
        name: title.name,
        publisher: title.publisher,
        pageCount: title.pageCount,
        size: title.size,
        author: title.author,
        majorId: major.id,
      },
    });
  }

  // Seed copies
  for (const copy of copies) {
    const bookTitle = await prisma.bookTitle.findFirst({
      where: { code: copy.bookTitleCode, deletedAt: null },
    });

    if (!bookTitle) {
      throw new Error(
        `BookTitle with code ${copy.bookTitleCode} not found for copy ${copy.code}`,
      );
    }

    await prisma.bookCopy.upsert({
      where: { code: copy.code },
      update: {
        bookTitleId: bookTitle.id,
        status: copy.status,
        acquiredAt: copy.acquiredAt,
        deletedAt: null,
      },
      create: {
        code: copy.code,
        bookTitleId: bookTitle.id,
        status: copy.status,
        acquiredAt: copy.acquiredAt,
      },
    });
  }

  // Seed readers
  for (const reader of readers) {
    await prisma.reader.upsert({
      where: { code: reader.code },
      update: {
        fullName: reader.fullName,
        className: reader.className,
        birthDate: reader.birthDate,
        gender: reader.gender,
        status: reader.status,
        deletedAt: null,
      },
      create: {
        code: reader.code,
        fullName: reader.fullName,
        className: reader.className,
        birthDate: reader.birthDate,
        gender: reader.gender,
        status: reader.status,
      },
    });
  }
};

void seedPhase3()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Phase 3 seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
