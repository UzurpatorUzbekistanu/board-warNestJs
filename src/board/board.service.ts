import { BadRequestException, Injectable } from '@nestjs/common'; // nest DI i bledy 400
import { DEFAULT_BOARD } from './data/board-definition'; // statyczna plansza
import GameBoard from './domain/board'; // typ planszy
import { HexCoords } from './domain/hex.types'; // koordy i kafle
import { Road, roadByDijkstra } from './domain/hex.utils'; // algorytm sciezki

@Injectable()
export class BoardService {
  private readonly board: GameBoard = DEFAULT_BOARD; // jedna instancja planszy do uzycia

  getDefaultBoard(): GameBoard {
    return this.board; // zwroc bieżąca plansze
  }

  countDistanceBetweenTwoTilles(
    fromCoords: HexCoords,
    toCoords: HexCoords,
  ): Road {
    const board = this.getDefaultBoard(); // pobierz plansze
    const same = (a: HexCoords, b: HexCoords) => a.q === b.q && a.r === b.r; // helper porownujacy koordy

    const from = board.tiles.find((t) => same(t.coords, fromCoords)); // startowy kafelek
    const to = board.tiles.find((t) => same(t.coords, toCoords)); // docelowy kafelek

    if (!from || !to) {
      throw new BadRequestException('Coords not on board'); // koordy poza mapa
    }

    const path = roadByDijkstra(from, to, board); // wyszukaj najtansza sciezke
    if (!path) {
      throw new BadRequestException('Path not found'); // brak trasy
    }
    return path; // zwroc koszt i sciezke
  }
}
