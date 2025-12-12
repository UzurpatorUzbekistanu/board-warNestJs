// src/prisma/prisma.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import 'dotenv/config'; // ladowanie env
import { Injectable, OnModuleInit } from '@nestjs/common'; // DI + hook init
import { PrismaClient } from '@prisma/client'; // klient Prisma
import { PrismaPg } from '@prisma/adapter-pg'; // adapter do pg
import { Pool } from 'pg'; // pulka polaczen

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL; // pobierz URL bazy

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set'); // walidacja configu
    }

    const pool = new Pool({ connectionString: databaseUrl }); // utworz pool PG
    const adapter = new PrismaPg(pool) as unknown; // adapter pg (typowany zewnetrznie)

    super({
      log: ['error', 'warn'], // wlaczone logi
      adapter: adapter as never, // podmien adapter na pg
    });
  }

  async onModuleInit() {
    await this.$connect(); // nawiaz polaczenie po starcie modulu
  }
}
