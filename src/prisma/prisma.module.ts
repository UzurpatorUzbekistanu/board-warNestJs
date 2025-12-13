import { Module } from '@nestjs/common'; // dekorator modulu
import { PrismaService } from './prisma.service'; // klient Prisma

@Module({
  providers: [PrismaService], // rejestruj serwis
  exports: [PrismaService], // udostepnij innym modulom
})
export class PrismaModule {}
