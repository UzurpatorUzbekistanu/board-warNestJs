import { Player } from 'src/player/domain/player'; // model gracza
import { HexTile } from 'src/board/domain/hex.types'; // kafelki planszy
import { UnitName } from 'src/units/domain/unit.types'; // typy jednostek

export type GameStatus = 'not_started' | 'in_progress' | 'finished' | 'paused'; // status gry

export interface GameState {
  gameId: string; // identyfikator gry
  turnNumber: number; // numer tury
  currentPlayerId: Player['id']; // id gracza ruchu
  status: GameStatus; // status gry
  players: PlayerInGameState[]; // gracze w grze
  units: UnitOnBoardState[]; // jednostki na planszy
  tiles: HexTileState[]; // kafle planszy
}

export interface PlayerInGameState {
  playerId: Player['id']; // id gracza
  name: string; // nazwa
  color?: string; // kolor gracza
}

export interface UnitOnBoardState {
  unitId: string; // uniqueId jednostki
  ownerPlayerId: Player['id']; // wlasciciel
  template: UnitName; // typ jednostki
  currentHP: number; // aktualne HP
  q: number; // pozycja q
  r: number; // pozycja r
}

export interface HexTileState {
  q: number; // wspolrzedna q
  r: number; // wspolrzedna r
  terrain: HexTile['terrain']; // rodzaj terenu
  passable: boolean; // czy przechodnie
  movementCost: number; // koszt ruchu
}

export type GameActionType = 'MOVE' | 'ATTACK' | 'END_TURN'; // typy akcji

export interface GameAction {
  id: string; // id akcji
  gameId: string; // id gry
  turnNumber: number; // numer tury
  playerId: Player['id']; // gracz wykonujacy
  type: GameActionType; // typ akcji
  payload: any; // dane akcji
  stateBefore?: GameState; // stan przed
  stateAfter?: GameState; // stan po
  rngRolls?: number[]; // rzuty koscia
  createdAt: Date; // znacznik czasu
}

export type SnapshotKind = 'initial' | 'before_action' | 'after_action'; // rodzaj zrzutu stanu

export interface GameStateSnapshot {
  id: number; // id zrzutu
  gameId: number; // id gry
  turnNumber: number; // tura
  status: GameStatus; // status w chwili zrzutu
  currentPlayerId: Player['id']; // aktywny gracz
  availableActions?: any; // opcjonalne dostepne akcje
  rngSeed?: string; // opcjonalny seed RNG
  kind: SnapshotKind; // rodzaj zrzutu
  state: GameState; // caly stan
  createdAt: Date; // czas utworzenia
}
