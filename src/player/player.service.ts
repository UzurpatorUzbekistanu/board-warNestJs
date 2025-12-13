import { Injectable } from '@nestjs/common'; // DI
import { type Player as PrismaPlayer } from '@prisma/client'; // model bazy
import { newPlayer, Player } from './domain/player'; // domenowy typ gracza
import { UnitName } from 'src/units/domain/unit.types'; // typy jednostek
import { UnitsService } from 'src/units/units.service'; // logika jednostek
import { PlayerRepositoryAdapter } from 'src/infrastructure/PlayerRepositoryAdapter'; // adapter repo graczy

@Injectable()
export class PlayerService {
  // In-memory helpers kept for unit logic; DB is the source of truth for players
  private players: Player[] = []; // lokalna lista graczy (legacy)
  private idCounter = 1; // licznik dla in-memory

  constructor(
    private readonly unitService: UnitsService, // serwis jednostek
    private readonly playerRepository: PlayerRepositoryAdapter, // warstwa dostepu do bazy
  ) {}

  private toDomain(dbPlayer: PrismaPlayer): Player {
    return {
      id: dbPlayer.id, // id gracza
      name: dbPlayer.name, // nazwa
      color: dbPlayer.color, // kolor
      budget: dbPlayer.budget, // budzet startowy
      turn: dbPlayer.turn, // czyjego ruchu
      units: [], // TODO: zaladowac z bazy gdy bedzie persystencja jednostek
    };
  }

  async create(name: string, color: string): Promise<Player> {
    const player: newPlayer = {
      name, // nazwa gracza
      color, // kolor
      units: [], // lista jednostek
      budget: 1000, // startowy budzet
      turn: true, // zaczyna ture
    };
    const created = await this.playerRepository.create(player); // zapis w bazie
    return this.toDomain(created); // mapowanie na domene
  }

  async findAll(): Promise<Player[]> {
    const players = await this.playerRepository.findAll(); // pobierz wszystkich
    return players.map((p) => {
      const domain = this.toDomain(p); // mapuj
      domain.units = this.unitService.getPlayerUnits(domain.id); // dolacz jednostki z pamieci
      return domain; // zwroc gracza z jednostkami
    });
  }

  async findById(id: Player['id']): Promise<Player | undefined> {
    const player = await this.playerRepository.findbyID(id); // pobierz z bazy
    if (!player) {
      return undefined;
    }
    const domain = this.toDomain(player); // mapuj
    domain.units = this.unitService.getPlayerUnits(domain.id); // dolacz jednostki
    return domain; // zwroc domenowy obiekt
  }

  deletePlayer(id: number) {
    return this.playerRepository.delete(id); // usun z bazy
  }

  async updatePlayer(
    id: Player['id'],
    name: string,
    color: string,
  ): Promise<Player | undefined> {
    const updated = await this.playerRepository.update(id, name, color); // aktualizuj
    return updated ? this.toDomain(updated) : undefined; // zwroc zmapowany lub undefined
  }

  // Below: legacy in-memory unit helpers; adjust when units are persisted in DB.
  async addUnitToPlayer(
    playerId: Player['id'],
    unitIdStr: string,
  ): Promise<Player | undefined> {
    const dbPlayer = await this.playerRepository.findbyID(playerId); // pobierz gracza
    const unitId: UnitName = unitIdStr as UnitName; // rzutowanie nazwy jednostki

    if (!dbPlayer) {
      return undefined;
    }

    const player = this.toDomain(dbPlayer); // zmapuj domene
    const newUnit = this.unitService.createUnit(unitId, player); // utworz jednostke
    player.units.push(newUnit); // dodaj do listy

    return player; // zwroc zaktualizowanego gracza (in-memory)
  }

  resetUnits(playerId: Player['id']): void {
    this.unitService.resetPlayerUnits(playerId); // wyczysc jednostki gracza w pamieci
  }

  deleteUnitFromPlayer(
    playerId: Player['id'],
    uniqueId: number,
  ): Player | undefined {
    const player = this.players.find((p) => p.id === playerId); // znajdz w in-memory
    if (!player) {
      return undefined;
    }
    const unitIndex = player.units.findIndex(
      (unit) => unit.uniqueId === uniqueId,
    ); // znajdz jednostke
    if (unitIndex !== -1) {
      player.units.splice(unitIndex, 1); // usun z listy
      return player; // zwroc gracza z aktualna lista
    }
    return undefined;
  }

  getPlayerBudget(playerId: Player['id']): number | undefined {
    const player = this.players.find((p) => p.id === playerId); // znajdz w in-memory
    return player ? player.budget : undefined; // zwroc budzet lub undefined
  }
}
