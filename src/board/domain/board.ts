import { SquareTile } from './square.types'; // definicja pojedynczego kafelka

export interface Board {
  tiles: SquareTile[]; // kolekcja kafelkow planszy
}

export default class GameBoard implements Board {
  constructor(public tiles: SquareTile[]) {} // inicjalizacja planszy

  getTiles(): SquareTile[] {
    return this.tiles; // zwroc cala plansze
  }
}
