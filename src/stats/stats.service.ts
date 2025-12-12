import { Injectable } from '@nestjs/common'; // DI serwisu
import { BattleResult as BattleResultEnum, Prisma } from '@prisma/client'; // enum wynikow + typy JSON
import { PrismaService } from '../prisma/prisma.service'; // klient bazy
import { RecordBattleDto } from './dto/record-battle.dto'; // dto zapisu bitwy

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {} // wstrzykniety prisma

  async recordBattle(userId: number, dto: RecordBattleDto) {
    const battle = await this.prisma.userBattle.create({
      data: {
        userId, // wlasciciel rekordu
        gameId: dto.gameId ?? null, // powiazanie z gra
        result: dto.result, // wynik
        damageDealt: dto.damageDealt, // zadane obrazenia
        damageTaken: dto.damageTaken, // otrzymane obrazenia
        units: dto.units as unknown as Prisma.JsonArray, // zapis jednostek
      },
    });
    return battle;
  }

  async getUserStats(userId: number) {
    const battles = await this.prisma.userBattle.findMany({
      where: { userId }, // filtr po userze
      orderBy: { createdAt: 'desc' }, // najnowsze pierwsze
    });

    const totals = battles.reduce(
      (acc, battle) => {
        acc.battles += 1; // licznik bitew
        acc.damageDealt += battle.damageDealt; // kumuluj dmg zadany
        acc.damageTaken += battle.damageTaken; // kumuluj dmg otrzymany
        if (battle.result === BattleResultEnum.win) acc.wins += 1; // zwyciestwa
        if (battle.result === BattleResultEnum.lose) acc.losses += 1; // porazki
        if (battle.result === BattleResultEnum.draw) acc.draws += 1; // remisy
        return acc; // zwroc akumulator
      },
      {
        battles: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        damageDealt: 0,
        damageTaken: 0,
      },
    );

    return { total: totals, battles }; // laczne statystyki + lista bitew
  }
}
