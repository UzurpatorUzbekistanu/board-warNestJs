import { HexTile } from './hex.types'; // definicja pojedynczego kafelka

export interface Board {
  tiles: HexTile[]; // kolekcja kafelkow planszy
}

export default class GameBoard implements Board {
  constructor(public tiles: HexTile[]) {} // inicjalizacja planszy gotowym zbiorem heksow

  getHexTile(): HexTile[] {
    return this.tiles; // zwroc cala plansze
  }
}
