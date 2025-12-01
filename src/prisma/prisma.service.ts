// src/prisma/prisma.service.ts
import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    // Use default Prisma client; DATABASE_URL handles the connection details (including schema)
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
}
