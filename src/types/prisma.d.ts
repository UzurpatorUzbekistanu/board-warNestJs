declare module '@prisma/client' {
  // Minimal Prisma namespace helpers used in codebase (JSON helpers).
  export namespace Prisma {
    export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
    export type JsonObject = { [Key in string]?: JsonValue };
    export type JsonArray = JsonValue[];
    export type InputJsonValue = JsonValue;
  }

  // Basic enum mirrors from schema.prisma.
  export type GameActionType = 'MOVE' | 'ATTACK' | 'END_TURN';
  export type GameStatus = 'not_started' | 'in_progress' | 'finished' | 'paused';
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

  // Lightweight PrismaClient stub with the delegates referenced in services.
  export class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T>;
    $transaction<T = any>(promises: Promise<any>[]): Promise<T>;

    game: any;
    player: any;
    gameAction: any;
    gameStateSnapshot: any;
    userBattle: any;
    user: any;
  }
}
