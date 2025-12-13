declare module '@prisma/client' {
  // Minimal Prisma namespace helpers used in codebase (JSON helpers).
  export namespace Prisma {
    export type JsonValue =
      | string
      | number
      | boolean
      | null
      | JsonObject
      | JsonValue[];
    export type JsonObject = { [Key in string]?: JsonValue };
    export type JsonArray = JsonValue[];
    export type InputJsonValue = JsonValue;

    export type PrismaPromise<T> = Promise<T>;
  }

  // Basic enum mirrors from schema.prisma.
  export type GameActionType = 'MOVE' | 'ATTACK' | 'END_TURN';
  export type GameStatus =
    | 'not_started'
    | 'in_progress'
    | 'finished'
    | 'paused';
  export type SnapshotKind = 'initial' | 'before_action' | 'after_action';
  export type BattleResult = 'win' | 'lose' | 'draw';
  export const BattleResult: {
    win: 'win';
    lose: 'lose';
    draw: 'draw';
  };

  // Simplified model shapes used for typing in services.
  export type Player = {
    id: number;
    name: string;
    color: string;
    budget: number;
    turn: boolean;
    createdAt: Date;
  };

  export type User = {
    id: number;
    email: string;
    passwordHash: string;
    displayName: string;
    createdAt: Date;
  };

  export type Game = {
    id: number;
    phase: GameStatus | 'created' | 'deployment' | 'battle';
    createdAt: Date;
    updatedAt: Date;
    status: GameStatus;
    stateJson: Prisma.JsonValue | null;
    playerId: number;
    enemyId: number;
  };

  export type Unit = {
    id: number;
    unitType: string;
    name: string;
    maxHp: number;
    meleeAttack: number;
    rangedAttack: number;
    attackRange: number;
    defense: number;
    speed: number;
    cost: number;
    uniqueId: number;
    posQ: number | null;
    posR: number | null;
    playerId: number;
    gameId: number | null;
  };

  export type GameAction = {
    id: string;
    gameId: number;
    turnNumber: number;
    playerId: number;
    type: GameActionType;
    payload: Prisma.JsonValue;
    stateBefore: Prisma.JsonValue | null;
    stateAfter: Prisma.JsonValue | null;
    rngRolls: Prisma.JsonValue | null;
    createdAt: Date;
  };

  export type GameStateSnapshot = {
    id: number;
    gameId: number;
    turnNumber: number;
    status: GameStatus;
    currentPlayerId: number;
    availableActions: Prisma.JsonValue | null;
    rngSeed: string | null;
    kind: SnapshotKind;
    state: Prisma.JsonValue;
    createdAt: Date;
  };

  export type UserBattle = {
    id: number;
    userId: number;
    gameId: number | null;
    result: BattleResult;
    damageDealt: number;
    damageTaken: number;
    units: Prisma.JsonValue;
    createdAt: Date;
  };

  export type Board = {
    id: number;
    width: number;
    height: number;
    seed: number | null;
    gameId: number;
  };

  export type Tile = {
    id: number;
    q: number;
    r: number;
    terrain: string;
    passable: boolean;
    movementCost: number;
    boardId: number;
  };

  type Delegate<T> = {
    findUnique(args?: unknown): Prisma.PrismaPromise<T | null>;
    findFirst(args?: unknown): Prisma.PrismaPromise<T | null>;
    findMany(args?: unknown): Prisma.PrismaPromise<T[]>;
    create(args: { data: unknown }): Prisma.PrismaPromise<T>;
    update(args: { where?: unknown; data: unknown }): Prisma.PrismaPromise<T>;
    delete(args: { where?: unknown }): Prisma.PrismaPromise<T>;
  };

  // Lightweight PrismaClient stub with typed delegates referenced in services.
  export class PrismaClient {
    constructor(options?: unknown);
    $connect(): Promise<void>;
    $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T>;
    $transaction<T extends readonly Promise<unknown>[]>(
      promises: T,
    ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;

    game: Delegate<Game>;
    player: Delegate<Player>;
    gameAction: Delegate<GameAction>;
    gameStateSnapshot: Delegate<GameStateSnapshot>;
    userBattle: Delegate<UserBattle>;
    user: Delegate<User>;
    unit: Delegate<Unit>;
    board: Delegate<Board>;
  }
}
