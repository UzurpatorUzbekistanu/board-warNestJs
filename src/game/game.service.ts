import { Injectable, NotFoundException } from '@nestjs/common'; // DI i 404
import {
  Prisma,
  GameActionType as PrismaGameActionType,
  GameStatus as PrismaGameStatus,
  SnapshotKind as PrismaSnapshotKind,
} from '@prisma/client'; // typy Prisma
import { BoardService } from 'src/board/board.service'; // logika planszy
import { PlayerService } from 'src/player/player.service'; // logika gracza
import { Game } from './domain/game'; // domenowy typ gry
import { CreateSoloGameDto } from './dto/create-solo-game.dto'; // dto tworzenia gry
import { Unit } from 'src/units/domain/unit.types'; // typ jednostki
import { UnitsService } from 'src/units/units.service'; // serwis jednostek
import { Player } from 'src/player/domain/player'; // model gracza
import { Board } from 'src/board/domain/board'; // model planszy
import { HexCoords } from 'src/board/domain/hex.types'; // koordy heksowe
import { PrismaService } from 'src/prisma/prisma.service'; // klient bazy
import {
  GameState,
  HexTileState,
  PlayerInGameState,
  UnitOnBoardState,
} from './model/game-state'; // struktury stanu gry
import { ApplyActionDto } from './dto/apply-action.dto'; // dto akcji

@Injectable()
export class GameService {
  private games: Game[] = []; // gry przechowywane w pamieci
  private idCounter = 1; // licznik id gier

  constructor(
    private readonly playerService: PlayerService,
    private readonly boardService: BoardService,
    private readonly unitService: UnitsService,
    private readonly prisma: PrismaService,
  ) {}

  async createSoloGame(dto: CreateSoloGameDto): Promise<Game> {
    const player = await this.playerService.findById(dto.playerId);
    if (!player) throw new Error("Player doesn't exist");

    const colorEnemy = player.color === 'red' ? 'blue' : 'red';
    let enemy = await this.playerService.findById(1); // lub inny stały ID
    if (!enemy) enemy = await this.playerService.create('Enemy', colorEnemy);
    enemy.turn = false;

    // tutaj TODO: wczytać/persistować armię w DB; tymczasowo trzymaj w pamięci
    const playerArmy: Unit[] = []; // trzeba zasilić z DB lub wygenerować
    const enemyArmy: Unit[] = [];

    const board = this.boardService.getDefaultBoard();
    const game = this.createGame(player, playerArmy, enemy, enemyArmy, board);
    game.phase = 'deployment';
    this.games.push(game);
    return game;
  }

  private createGame(
    player: Player,
    playerArmy: Unit[],
    enemy: Player,
    enemyArmy: Unit[],
    board: Board,
  ): Game {
    const game: Game = {
      id: this.idCounter++,
      player,
      playerArmy,
      enemy: enemy,
      enemyArmy,
      board,
      phase: 'created',
      createdAt: new Date(),
    };

    return game;
  }

  setUnitPosition(
    gameId: number,
    unitUniqueId: number,
    coords: HexCoords,
  ): Game | undefined {
    const game: Game = this.findById(gameId);
    let unit = game.playerArmy.find((u) => u.uniqueId === unitUniqueId);
    if (!unit) {
      unit = game.enemyArmy.find((u) => u.uniqueId === unitUniqueId);
    }
    if (!unit) {
      throw new Error('Unit not found');
    }
    let isOccupied: boolean = this.isOccupied(game.playerArmy, coords);
    isOccupied = this.isOccupied(game.enemyArmy, coords);
    if (isOccupied) {
      unit.position = coords;
    } else {
      return undefined;
    }

    return game;
  }

  findById(gameId: number): Game {
    const game: Game[] = this.games.filter((game) => game.id === gameId);
    return game[0];
  }

  isOccupied(units: Unit[], coords: HexCoords): boolean {
    return units.some(
      (u) =>
        u.position?.q != null &&
        u.position?.r != null &&
        u.position.q === coords.q &&
        u.position.r === coords.r,
    );
  }

  finishDeployment(gameId: number): Game | undefined {
    const game: Game = this.findById(gameId);

    const isGameInDeployment: boolean =
      game.phase === 'deployment' ? true : false;

    if (!isGameInDeployment) return undefined;

    const isPlayerArmyDeployed: boolean =
      game.playerArmy.filter((unit) => unit.position == null).length > 0
        ? true
        : false;
    const isEnemyArmyDeployed: boolean =
      game.enemyArmy.filter((unit) => unit.position == null).length > 0
        ? true
        : false;
    if (!(isPlayerArmyDeployed && isEnemyArmyDeployed)) return undefined;

    game.phase = 'battle';

    return game;
  }

  async moveUnit(
    gameId: number,
    unitUniqueId: number,
    targetCoords: HexCoords,
  ): Promise<HexCoords | undefined> {
    const game: Game = this.findById(gameId);
    const isPassable = game.board.tiles.find(
      (coords) => coords.coords == targetCoords,
    )?.passable;
    if (!isPassable) {
      return undefined;
    }
    const player = await this.playerService.findById(unitUniqueId);
    const currentPosition = player?.units.find(
      (unit) => unit.uniqueId == unitUniqueId,
    )?.position;
    if (!currentPosition) return undefined;

    return targetCoords;
  }

  async createStatefulSoloGame(dto: CreateSoloGameDto): Promise<GameState> {
    const player = await this.playerService.findById(dto.playerId);
    if (!player) throw new NotFoundException("Player doesn't exist");

    const enemy = await this.resolveEnemy(player);
    const board = this.boardService.getDefaultBoard();
    const playerArmy = this.unitService.getPlayerUnits(player.id);
    this.unitService.resetUnitsHp(playerArmy);
    this.unitService.resetPlayerUnits(enemy.id);
    const enemyArmy = this.unitService.cloneArmyForPlayer(playerArmy, enemy);
    this.unitService.resetBattleStatsForPlayers([player.id, enemy.id]);

    const baseState = this.buildSnapshot(
      '',
      player,
      enemy,
      playerArmy,
      enemyArmy,
      board,
    );

    const createdGame = await this.prisma.game.create({
      data: {
        phase: 'created',
        playerId: player.id,
        enemyId: enemy.id,
        status: 'not_started' as PrismaGameStatus,
      },
    });

    const stateWithId: GameState = {
      ...baseState,
      gameId: createdGame.id.toString(),
    };
    await this.prisma.game.update({
      where: { id: createdGame.id },
      data: {
        stateJson: stateWithId as unknown as Prisma.InputJsonValue,
        status: stateWithId.status as PrismaGameStatus,
      },
    });

    await this.prisma.gameStateSnapshot.create({
      data: this.toSnapshotData(createdGame.id, stateWithId, 'initial'),
    });

    return stateWithId;
  }

  async getGameState(gameId: number): Promise<GameState> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game || !game.stateJson) {
      throw new NotFoundException('Game not found');
    }

    return game.stateJson as unknown as GameState;
  }

  async applyAction(
    gameId: number,
    actionDto: ApplyActionDto,
  ): Promise<GameState> {
    // Pobierz aktualny stan gry z bazy.
    const currentState = await this.getGameState(gameId);
    // Zrób głęboką kopię stanu na potrzeby logów/snapshotów.
    const stateBefore = this.cloneState(currentState);
    // Wylicz nowy stan po zastosowaniu akcji.
    const updatedState = this.reduceAction(
      this.cloneState(currentState),
      actionDto,
    );
    // Zapisz rzuty RNG przekazane w akcji (jeśli są).
    const payloadRolls = (actionDto.payload as { rolls?: unknown } | undefined)
      ?.rolls;
    const rngRolls = actionDto.rolls ?? payloadRolls ?? null;

    // W jednej transakcji zapisujemy nowy stan gry, log akcji i snapshoty.
    await this.prisma.$transaction([
      // Aktualizacja rekordu gry o nowy stan i status.
      this.prisma.game.update({
        where: { id: gameId },
        data: {
          stateJson: updatedState as unknown as Prisma.InputJsonValue,
          status: updatedState.status as PrismaGameStatus,
        },
      }),
      // Log pojedynczej akcji gracza wraz z kopiami stanów.
      this.prisma.gameAction.create({
        data: {
          gameId,
          turnNumber: updatedState.turnNumber,
          playerId: actionDto.playerId ?? updatedState.currentPlayerId,
          type: actionDto.type as PrismaGameActionType,
          payload: (actionDto.payload ??
            {}) as unknown as Prisma.InputJsonValue,
          rngRolls: rngRolls as unknown as Prisma.InputJsonValue,
          stateBefore: stateBefore as unknown as Prisma.InputJsonValue,
          stateAfter: updatedState as unknown as Prisma.InputJsonValue,
        },
      }),
      // Snapshot stanu przed akcją (ułatwia odtwarzanie historii/undo).
      this.prisma.gameStateSnapshot.create({
        data: this.toSnapshotData(gameId, stateBefore, 'before_action'),
      }),
      // Snapshot stanu po akcji.
      this.prisma.gameStateSnapshot.create({
        data: this.toSnapshotData(gameId, updatedState, 'after_action'),
      }),
    ]);

    // Zwróć zaktualizowany stan gry.
    return updatedState;
  }

  private reduceAction(
    currentState: GameState,
    actionDto: ApplyActionDto,
  ): GameState {
    // Budujemy kolejny stan: kopiujemy dane, podbijamy status i klonujemy list? jednostek.
    const nextState: GameState = {
      ...currentState,
      status: this.bumpStatus(currentState.status),
      units: currentState.units.map((u) => ({ ...u })),
    };

    // Reakcja na konkretny typ akcji gracza.
    switch (actionDto.type) {
      case 'MOVE': {
        // Przesu? jednostk?, gdy przekazano jej id oraz nowe wsp??rz?dne.
        const { unitId, q, r } =
          (actionDto.payload as Partial<{
            unitId: string | number;
            q: number;
            r: number;
          }>) ?? {};
        if (unitId !== undefined && q !== undefined && r !== undefined) {
          nextState.units = nextState.units.map((u) =>
            u.unitId === String(unitId) ? { ...u, q, r } : u,
          );
        }
        break;
      }
      case 'ATTACK': {
        // Zdejmij punkty ?ycia z celu; HP nie spada poni?ej zera.
        const { targetUnitId, damage } =
          (actionDto.payload as Partial<{
            targetUnitId: string | number;
            damage: number;
          }>) ?? {};
        if (targetUnitId !== undefined && typeof damage === 'number') {
          nextState.units = nextState.units.map((u) =>
            u.unitId === String(targetUnitId)
              ? { ...u, currentHP: Math.max(0, u.currentHP - damage) }
              : u,
          );
        }
        break;
      }
      case 'END_TURN': {
        // Zako?czenie tury: zwi?ksz licznik i prze??cz aktywnego gracza.
        nextState.turnNumber += 1;
        nextState.currentPlayerId = this.nextPlayerId(
          nextState.players,
          nextState.currentPlayerId,
        );
        break;
      }
      default:
        break;
    }

    return nextState;
  }
  private bumpStatus(status: GameState['status']): GameState['status'] {
    if (status === 'finished' || status === 'paused') {
      return status;
    }
    return status === 'not_started' ? 'in_progress' : status;
  }

  private nextPlayerId(
    players: PlayerInGameState[],
    currentPlayerId: number,
  ): number {
    if (!players.length) return currentPlayerId;
    const currentIdx = players.findIndex((p) => p.playerId === currentPlayerId);
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % players.length;
    return players[nextIdx].playerId;
  }

  private buildSnapshot(
    gameId: string,
    player: Player,
    enemy: Player,
    playerArmy: Unit[],
    enemyArmy: Unit[],
    board: Board,
  ): GameState {
    const playersState: PlayerInGameState[] = [
      { playerId: player.id, name: player.name, color: player.color },
      { playerId: enemy.id, name: enemy.name, color: enemy.color },
    ];

    const unitsState = [...playerArmy, ...enemyArmy].map((unit) =>
      this.toUnitState(unit),
    );

    return {
      gameId,
      turnNumber: 1,
      currentPlayerId: player.id,
      status: 'not_started',
      players: playersState,
      units: unitsState,
      tiles: this.toTilesState(board),
    };
  }

  private toUnitState(unit: Unit): UnitOnBoardState {
    const hp = this.unitService.getCurrentHp(unit.uniqueId) ?? unit.maxHp;
    return {
      unitId: unit.uniqueId.toString(),
      ownerPlayerId: unit.playerId,
      template: unit.id,
      currentHP: hp,
      q: unit.position?.q ?? 0,
      r: unit.position?.r ?? 0,
    };
  }

  private toTilesState(board: Board): HexTileState[] {
    return board.tiles.map((tile) => ({
      q: tile.coords.q,
      r: tile.coords.r,
      terrain: tile.terrain,
      passable: tile.passable,
      movementCost: tile.movementCost,
    }));
  }

  private async resolveEnemy(player: Player): Promise<Player> {
    const colorEnemy = player.color === 'red' ? 'blue' : 'red';
    let enemy = await this.playerService.findById(1);

    // Ensure enemy is not the same player; if missing or same ID, create a fresh enemy.
    if (!enemy || enemy.id === player.id) {
      enemy = await this.playerService.create('Enemy', colorEnemy);
    }
    enemy.turn = false;
    return enemy;
  }

  async getTrajectory(gameId: number) {
    // Pobierz uporządkowane akcje i snapshoty w jednej transakcji, aby móc odtworzyć historię gry.
    const [actions, snapshots] = await this.prisma.$transaction([
      // Lista akcji z danej gry, rosnąco po czasie utworzenia.
      this.prisma.gameAction.findMany({
        where: { gameId },
        orderBy: { createdAt: 'asc' },
      }),
      // Snapshoty stanów gry, uporządkowane według tury i czasu utworzenia.
      this.prisma.gameStateSnapshot.findMany({
        where: { gameId },
        orderBy: [{ turnNumber: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    // Brak akcji i snapshotów oznacza brak historii dla danej gry.
    if (!actions.length && !snapshots.length) {
      throw new NotFoundException('Game trajectory not found');
    }

    // Zwracamy pełną trajektorię gry: akcje + snapshoty.
    return { gameId, actions, snapshots };
  }

  private cloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state)) as GameState;
  }

  private toSnapshotData(
    gameId: number,
    state: GameState,
    kind: PrismaSnapshotKind,
  ) {
    return {
      gameId,
      turnNumber: state.turnNumber,
      status: state.status as PrismaGameStatus,
      currentPlayerId: state.currentPlayerId,
      kind,
      state: state as unknown as Prisma.InputJsonValue,
    };
  }
}
