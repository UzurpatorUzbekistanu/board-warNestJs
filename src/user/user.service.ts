import { Injectable } from '@nestjs/common'; // DI Nest
import { type User, type Player } from '@prisma/client'; // typy Prisma
import { PrismaService } from '../prisma/prisma.service'; // serwis bazy
import { RegisterDto } from '../auth/dto/register.dto'; // dane rejestracji

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {} // wstrzykniecie klienta Prisma

  async createWithPlayer(
    dto: RegisterDto,
    passwordHash: string,
  ): Promise<{ user: User; player: Player }> {
    const lowerEmail = dto.email.toLowerCase(); // normalizacja email

    const { user, player } = await this.prisma.$transaction(async (tx) => {
      const player = await tx.player.create({
        data: {
          name: dto.displayName, // nazwa gracza
          color: dto.color, // kolor pionka
        },
      });

      const user = await tx.user.create({
        data: {
          id: player.id, // id rowna sie id playera
          email: lowerEmail, // email jako klucz
          passwordHash, // haslo zahashowane
          displayName: dto.displayName, // wyswietlana nazwa
        },
      });

      return { user, player };
    });

    return { user, player };
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // wyszukaj po znormalizowanym email
    });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } }); // pobierz po id
  }

  toSafeUser(user: User) {
    return {
      id: user.id, // klucz
      email: user.email, // adres
      displayName: user.displayName, // nazwa
      createdAt: user.createdAt, // kiedy zalozono
    };
  }
}
