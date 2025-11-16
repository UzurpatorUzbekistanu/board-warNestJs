export interface Unit {
    name: string;
    id: UnitName;
    maxHp: number;
    meleeAttack: number;
    rangedAttack: number;
    attackRange: number;
    defense: number;
    speed: number;
    cost: number;
    uniqueId: number;
    position?: { x: number; y: number };
    playerId?: string;
}

export type UnitName =
  | 'light-infantry'
  | 'line-infantry'
  | 'guard-infantry'
  | 'light-cavalry'
  | 'dragon-cavalry'
  | 'heavy-cavalry'
  | 'twelve-pounder-cannon'
  | 'six-pounder-cannon'
  | 'howitzer-cannon';
