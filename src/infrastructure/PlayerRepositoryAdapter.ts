import { Injectable } from '@nestjs/common'; // rejestracja w kontenerze DI
import { newPlayer } from 'src/player/domain/player'; // domenowy typ nowego gracza
import { PlayerRepositoryPort } from 'src/player/ports/PlayerRepositoryPort'; // port repo gracza
import { PrismaService } from 'src/prisma/prisma.service'; // klient Prisma
import { type Player } from '@prisma/client'; // model gracza z bazy

@Injectable()
export class PlayerRepositoryAdapter implements PlayerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {} // wstrzykniecie prisma

  findByName(name: string): Promise<Player | null> {
    return this.prisma.player.findFirst({
      where: {
        name: name, // filtr po nazwie
      },
    });
  }

  create(player: newPlayer): Promise<Player> {
    return this.prisma.player.create({
      data: {
        name: player.name, // nazwa
        color: player.color, // kolor
        budget: player.budget, // budzet startowy
        turn: player.turn, // kolejnosc ruchu
      },
    });
  }

  findbyID(id: number): Promise<Player | null> {
    return this.prisma.player.findUnique({
      where: { id }, // wyszukaj po kluczu
    });
  }

  findAll(): Promise<Player[]> {
    return this.prisma.player.findMany(); // lista graczy
  }

  delete(id: number): Promise<Player> {
    return this.prisma.player.delete({
      where: {
        id: id, // id rekordu
      },
    });
  }

  update(id: number, name: string, color: string): Promise<Player> {
    return this.prisma.player.update({
      where: { id }, // ktory rekord
      data: {
        // jakie pola zmieniasz
        name, // nazwa
        color, // kolor
      },
    });
  }
}
