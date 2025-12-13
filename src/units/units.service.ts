import { Injectable } from '@nestjs/common'; // DI Nest
import { Player } from 'src/player/domain/player'; // model gracza
import { Unit, UnitName } from './domain/unit.types'; // typy jednostek
import { UnitFactory } from './domain/unit-factory'; // fabryka jednostek

export type VictoryMode = 'points' | 'last-standing' | 'turns';

export interface GameConfig {
  mode: VictoryMode; // tryb zwyciestwa
  turnLimit?: number; // limit tur dla trybu turns
}

export interface BattleStats {
  totalDamage: number; // suma obrazen ogolem
  totalDamageByPlayer: Record<number, number>; // obrazenia per gracz
  unitsByType: Record<
    UnitName,
    {
      count: number; // liczba jednostek typu
      alive: number; // ilu zyje
      damageTaken: number; // obrazenia otrzymane
    }
  >;
}

export interface GameEndState {
  gameOver: true; // flaga zakonczenia
  winnerId?: number; // id zwyciezcy
  reason: string; // powod zakonczenia
  stats: BattleStats; // statystyki bitwy
}

export interface AttackResult {
  attackerId: number; // kto atakuje
  defenderId: number; // kto broni
  mode: 'melee' | 'ranged'; // tryb walki
  damage: number; // zadane obrazenia
  defenderHpBefore: number; // hp przed
  defenderHpAfter: number; // hp po
  destroyed: boolean; // czy zniszczony
  gameOver: boolean; // czy koniec gry
  winnerId?: number; // zwyciezca
  reason?: string; // powod konca
  stats?: BattleStats; // statystyki jesli koniec
}

@Injectable()
export class UnitsService {
  private customUnits: Unit[] = []; // wszystkie jednostki w grze
  private readonly factory = new UnitFactory(); // tworzenie egzemplarzy
  private readonly unitHp = new Map<number, number>(); // uniqueId -> current hp
  private readonly totalDamageByPlayer = new Map<number, number>(); // playerId -> total damage dealt
  private gameConfig: GameConfig | null = null; // konfiguracja trybu
  private turnCount = 0; // licznik tur
  private gameOver = false; // flaga zakonczenia
  private winnerId: number | undefined; // id zwyciezcy
  private endReason: string | undefined; // powod zakonczenia

  createUnit(id: UnitName, player: Player): Unit {
    return this.createUnitForPlayer(id, player, true); // rekrutuj jednostke potrącając budzet
  }
  createUnitWithoutPlayer(id: UnitName): Unit {
    const newUnit = this.factory.createFromName(id); // szablon bez gracza
    newUnit.playerId = 0; // brak wlasciciela
    return this.registerUnit(newUnit); // zarejestruj w stanie
  }

  createUnitForPlayer(
    id: UnitName,
    player: Player,
    subtractBudget = false,
  ): Unit {
    const newUnit = this.factory.createFromName(id); // buduj jednostke z szablonu
    newUnit.playerId = player.id; // przypisz wlasciciela

    if (subtractBudget) {
      player.budget -= newUnit.cost; // potrac budzet
      if (player.budget < 0) {
        throw new Error('Insufficient budget to create this unit.'); // brak srodkow
      }
    }

    return this.registerUnit(newUnit); // zapisz jednostke
  }

  private registerUnit(unit: Unit): Unit {
    this.customUnits.push(unit); // dodaj do listy
    this.unitHp.set(unit.uniqueId, unit.maxHp); // zainicjuj HP
    return unit; // zwroc referencje
  }

  getPlayerUnits(playerId: Player['id']): Unit[] {
    return this.customUnits.filter((unit) => unit.playerId === playerId); // jednostki danego gracza
  }

  resetPlayerUnits(playerId: Player['id']) {
    const remainingUnits = this.customUnits.filter(
      (unit) => unit.playerId !== playerId,
    ); // pozostale jednostki
    const remainingIds = new Set(remainingUnits.map((unit) => unit.uniqueId)); // id pozostalych

    this.customUnits = remainingUnits; // nadpisz liste

    Array.from(this.unitHp.keys()).forEach((uniqueId) => {
      if (!remainingIds.has(uniqueId)) {
        this.unitHp.delete(uniqueId); // skasuj HP dla usunietych
      }
    });

    this.totalDamageByPlayer.delete(playerId); // wyzeruj statystyki obrazen
  }

  resetUnitsHp(units: Unit[]) {
    units.forEach((unit) => {
      this.unitHp.set(unit.uniqueId, unit.maxHp); // odnow HP kazdej jednostki
    });
  }

  resetBattleStatsForPlayers(playerIds: Player['id'][]) {
    playerIds.forEach((id) => this.totalDamageByPlayer.delete(id)); // wyzeruj damage licznik
  }

  cloneArmyForPlayer(units: Unit[], player: Player): Unit[] {
    return units.map((unit) => this.createUnitForPlayer(unit.id, player)); // sklonuj jednostki dla innego gracza
  }

  startGame(config: GameConfig) {
    if (
      config.mode === 'turns' &&
      (!config.turnLimit || config.turnLimit < 1)
    ) {
      throw new Error(
        'Turn limit must be provided and greater than 0 for turn-based mode.',
      ); // walidacja limitu tur
    }
    this.gameConfig = config; // ustaw konfiguracje
    this.turnCount = 0; // reset licznik
    this.gameOver = false; // odblokuj gre
    this.winnerId = undefined; // brak zwyciezcy
    this.endReason = undefined; // brak powodu
    this.totalDamageByPlayer.clear(); // wyczysc statystyki
  }

  getAllAvailableUnits(): Unit[] {
    return this.factory.getAllUnitTemplates(); // lista szablonow
  }

  getUnitById(id: UnitName): Unit {
    return this.factory.createFromName(id); // instancja z szablonu
  }

  getUnitInstance(uniqueId: number): Unit | undefined {
    return this.customUnits.find((u) => u.uniqueId === uniqueId); // znajdz jednostke po uniqueId
  }

  getCurrentHp(uniqueId: number): number | undefined {
    return this.unitHp.get(uniqueId); // zwroc HP z mapy
  }

  attack(
    attackerId: number,
    defenderId: number,
    mode: 'melee' | 'ranged' = 'melee',
  ): AttackResult {
    if (this.gameOver) {
      throw new Error('Game has already finished.'); // brak atakow po koncu gry
    }
    const attacker = this.getUnitInstance(attackerId); // pobierz atakujacego
    const defender = this.getUnitInstance(defenderId); // pobierz broniacego
    if (!attacker || !defender) {
      throw new Error('Attacker or defender not found');
    }

    const defenderHp = this.unitHp.get(defender.uniqueId); // bieżące HP
    if (defenderHp === undefined) {
      throw new Error('Defender HP state missing');
    }

    const attackValue =
      mode === 'ranged' ? attacker.rangedAttack : attacker.meleeAttack; // wybierz statystyke
    const rawDamage = attackValue - defender.defense; // podstawowy dmg
    const roll = Math.floor(Math.random() * 6) + 1; // rzut koscia 1-6
    const damage = roll === 6 ? 0 : Math.max(1, rawDamage); // szostka = pudlo, inaczej min 1 dmg

    this.recordDamage(attacker.playerId, damage); // zarejestruj obrazenia

    const newHp = Math.max(0, defenderHp - damage); // oblicz pozostale HP
    this.unitHp.set(defender.uniqueId, newHp); // zapisz stan

    const destroyed = newHp === 0; // czy jednostka zniszczona
    const endState = destroyed ? this.evaluateElimination() : null; // sprawdz zwyciestwo last-standing
    if (endState) {
      this.setGameOver(endState); // ustaw koniec gry
    }

    return {
      attackerId: attacker.uniqueId,
      defenderId: defender.uniqueId,
      mode,
      damage,
      defenderHpBefore: defenderHp,
      defenderHpAfter: newHp,
      destroyed,
      gameOver: endState?.gameOver ?? false,
      winnerId: endState?.winnerId,
      reason: endState?.reason,
      stats: endState?.stats,
    };
  }

  recordTurnEnd(): GameEndState | null {
    if (!this.gameConfig || this.gameConfig.mode !== 'turns' || this.gameOver) {
      return null; // nie naliczaj gdy brak konfiguracji/koniec gry
    }
    this.turnCount += 1; // kolejna tura
    if (
      this.gameConfig.turnLimit &&
      this.turnCount >= this.gameConfig.turnLimit
    ) {
      const endState = this.finishByDamage('turn-limit-reached'); // koncz po osiagnieciu limitu
      this.setGameOver(endState); // ustaw koniec gry
      return endState; // zwroc finalny stan
    }
    return null; // gra trwa dalej
  }

  finishPointsMode(): GameEndState {
    if (!this.gameConfig || this.gameConfig.mode !== 'points') {
      throw new Error('Points victory mode is not active.'); // walidacja trybu
    }
    if (this.gameOver && this.endReason) {
      return {
        gameOver: true,
        winnerId: this.winnerId,
        reason: this.endReason,
        stats: this.getBattleStats(),
      };
    }
    const endState = this.finishByDamage('points-mode-finished'); // rozstrzygnij po obrazeniach
    this.setGameOver(endState); // ustaw koniec gry
    return endState; // zwroc finalny stan
  }

  getBattleStats(): BattleStats {
    const unitsByType: BattleStats['unitsByType'] =
      {} as BattleStats['unitsByType'];

    this.customUnits.forEach((unit) => {
      const hp = this.unitHp.get(unit.uniqueId); // pobierz HP z mapy
      const currentHp = hp === undefined ? unit.maxHp : hp; // default gdy brak wpisu
      const damageTaken = Math.max(0, unit.maxHp - currentHp); // ile obrazen dostal
      const bucket = unitsByType[unit.id] ?? {
        count: 0,
        alive: 0,
        damageTaken: 0,
      };
      bucket.count += 1;
      if (currentHp > 0) {
        bucket.alive += 1;
      }
      bucket.damageTaken += damageTaken; // kumuluj obrazenia
      unitsByType[unit.id] = bucket; // zapisz statystyki typu
    });

    const totalDamageByPlayer: Record<number, number> = {};
    this.totalDamageByPlayer.forEach((value, playerId) => {
      totalDamageByPlayer[playerId] = value; // przenies do zwyklej mapy
    });

    const totalDamage = Object.values(totalDamageByPlayer).reduce(
      (acc, curr) => acc + curr,
      0,
    ); // suma obrazen

    return {
      totalDamage,
      totalDamageByPlayer,
      unitsByType,
    };
  }

  private recordDamage(playerId: number, amount: number) {
    const current = this.totalDamageByPlayer.get(playerId) ?? 0; // dotychczasowe obrazenia
    this.totalDamageByPlayer.set(playerId, current + amount); // zaktualizuj licznik
  }

  private evaluateElimination(): GameEndState | null {
    if (!this.gameConfig || this.gameConfig.mode !== 'last-standing') {
      return null; // tryb nieaktywny
    }
    const alivePlayers = this.getAlivePlayerIds(); // zbierz zywych graczy
    if (alivePlayers.length === 1) {
      return this.finishWithWinner(alivePlayers[0], 'all-opponents-eliminated'); // jeden gracz -> zwyciezca
    }
    return null; // gra trwa
  }

  private getAlivePlayerIds(): number[] {
    const alive = new Set<number>(); // unikalni gracze zywi
    this.customUnits.forEach((unit) => {
      const hp = this.unitHp.get(unit.uniqueId) ?? unit.maxHp; // HP jednostki
      if (hp > 0) {
        alive.add(unit.playerId); // gracz ma zywa jednostke
      }
    });
    return Array.from(alive); // zwroc liste id
  }

  private finishByDamage(reason: string): GameEndState {
    const winnerId = this.getWinnerByDamage(); // znajdz zwyciezce po obrazeniach
    return this.finishWithWinner(winnerId, reason); // zwroc stan konca
  }

  private getWinnerByDamage(): number | undefined {
    let winnerId: number | undefined; // aktualny lider
    let topDamage = -1; // najwyzszy wynik
    let tie = false; // flaga remisu

    this.totalDamageByPlayer.forEach((damage, playerId) => {
      if (damage > topDamage) {
        topDamage = damage; // ustaw nowy top
        winnerId = playerId; // zapisz lidera
        tie = false; // reset remisu
      } else if (damage === topDamage) {
        tie = true; // remis -> brak zwyciezcy
      }
    });

    return tie ? undefined : winnerId; // undefined oznacza remis
  }

  private finishWithWinner(
    winnerId: number | undefined,
    reason: string,
  ): GameEndState {
    const stats = this.getBattleStats(); // oblicz statystyki
    return {
      gameOver: true,
      winnerId,
      reason,
      stats,
    };
  }

  private setGameOver(state: GameEndState) {
    this.gameOver = true; // blokada dalszych akcji
    this.winnerId = state.winnerId; // zapisz zwyciezce
    this.endReason = state.reason; // powod zakonczenia
  }
}
