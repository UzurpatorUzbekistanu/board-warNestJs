// Minimal runtime stub for @prisma/client used in tests.
export class PrismaClient {
  $connect(): Promise<void> {
    return Promise.resolve();
  }

  $transaction<T>(input: T): Promise<T> {
    return Promise.resolve(input);
  }
}

// Basic Prisma namespace mock
export const Prisma = {
  JsonArray: Array,
};
