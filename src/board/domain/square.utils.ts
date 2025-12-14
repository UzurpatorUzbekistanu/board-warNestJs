import { Board } from './board'; // reprezentacja planszy z kafelkami
import { SquareCoords, SquareTile } from './square.types'; // typy pomocnicze dla planszy kwadratowej

export function countMovement(from: SquareCoords, to: SquareCoords) {
  const distanceQ = Math.abs(from.q - to.q); // roznica w osi poziomej
  const distanceR = Math.abs(from.r - to.r); // roznica w osi pionowej
  return distanceQ + distanceR; // dystans manhattan na siatce kwadratowej
}

export type Road = {
  movementCost: number; // suma kosztow ruchu
  road: SquareTile[]; // kolejne kafelki trasy
};
export type TileWithCostReach = {
  tile: SquareTile; // kafelek
  cost: number; // koszt dojscia do kafelka
  visited: boolean; // czy juz przetworzony
};
export function roadByDijkstra(
  positionTile: SquareTile,
  targetTile: SquareTile,
  board: Board,
): Road | undefined {
  const tilesToCheck: TileWithCostReach[] = []; // kolejka priorytetowa (reczna)
  const closed: SquareTile[] = []; // zamkniete wezly
  const cameFrom: { tile: SquareTile; prev: SquareTile | null }[] = []; // poprzednik dla rekonstrukcji sciezki

  const startTile: TileWithCostReach = {
    tile: positionTile,
    cost: 0,
    visited: false,
  }; // start z kosztem 0

  tilesToCheck.push(startTile); // wrzuc start na liste otwartych
  cameFrom.push({ tile: positionTile, prev: null }); // brak poprzednika na starcie

  const same = (a: SquareTile, b: SquareTile) =>
    a.coords.q === b.coords.q && a.coords.r === b.coords.r; // pomocnicze porownanie koordow

  const inList = (arr: SquareTile[], t: SquareTile) =>
    arr.some((x) => same(x, t)); // sprawdz czy element jest na liscie

  const getPrevEntry = (t: SquareTile) => cameFrom.find((e) => same(e.tile, t)); // znajdz wejscie poprzednika

  while (tilesToCheck.length !== 0) {
    let currentIndex = 0; // indeks kafla o najnizszym koszcie
    for (let i = 1; i < tilesToCheck.length; i++) {
      if (tilesToCheck[i].cost < tilesToCheck[currentIndex].cost) {
        currentIndex = i; // znajdz mniejszy koszt
      }
    }

    const current = tilesToCheck.splice(currentIndex, 1)[0]; // wyjmij najtanszy
    current.visited = true; // oznacz jako odwiedzony
    closed.push(current.tile); // przenies do zamknietych

    if (same(current.tile, targetTile)) {
      const path: SquareTile[] = []; // przechowywana sciezka wynikowa
      let cur: SquareTile | null = current.tile;
      while (cur) {
        path.push(cur); // dodaj kafelek do sciezki
        const entry = getPrevEntry(cur); // znajdz poprzednika
        cur = entry ? entry.prev : null; // przesun wskaznik
      }
      return { movementCost: current.cost, road: path.reverse() }; // zwroc koszt i odwrocona sciezke
    }

    const neighbors: SquareTile[] = getNeighbors(current.tile, board); // pobierz sasiednie przechodnie pola

    for (const n of neighbors) {
      if (inList(closed, n)) continue; // pomijamy juz zamkniete

      const tentative = current.cost + n.movementCost; // koszt przejscia do sasiada

      const existing = tilesToCheck.find((x) => same(x.tile, n));
      if (!existing) {
        tilesToCheck.push({ tile: n, cost: tentative, visited: false }); // dodaj nowy sasiad
        cameFrom.push({ tile: n, prev: current.tile }); // zapisz poprzednika
      } else if (tentative < existing.cost) {
        existing.cost = tentative; // popraw koszt gdy lepsza trasa
        const prevEntry = getPrevEntry(n);
        if (prevEntry) prevEntry.prev = current.tile; // zaktualizuj poprzednika
      }
    }
  }

  return undefined; // brak sciezki
}

function getNeighbors(tile: SquareTile, board: Board): SquareTile[] {
  const dirs = [
    { q: 1, r: 0 },
    { q: -1, r: 0 },
    { q: 0, r: 1 },
    { q: 0, r: -1 },
  ]; // dozwolone ruchy (brak skosow)
  return dirs
    .map(
      ({ q, r }) =>
        board.tiles.find(
          (t) =>
            t.coords.q === tile.coords.q + q &&
            t.coords.r === tile.coords.r + r,
        ), // znajdz kafelki w sasiedztwie
    )
    .filter((t): t is SquareTile => !!t && t.passable); // zwroc tylko istniejace i przechodnie
}
