import { HexCoords } from 'src/board/domain/hex.types'; // koordy na planszy

export interface Unit {
  name: string; // nazwa czytelna
  id: UnitName; // identyfikator typu jednostki
  maxHp: number; // maksymalne HP
  meleeAttack: number; // sila walki wrecz
  rangedAttack: number; // sila strzalu
  attackRange: number; // zasieg ostrzalu
  defense: number; // obrona
  speed: number; // ile pol ruchu
  cost: number; // koszt rekrutacji
  uniqueId: number; // unikalny id egzemplarza
  position: HexCoords | null; // polozenie na planszy
  playerId: number; // wlasciciel
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
