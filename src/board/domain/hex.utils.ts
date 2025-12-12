import { Board } from './board'; // reprezentacja planszy z kafelkami
import { HexCoords, HexTile } from './hex.types'; // typy pomocnicze dla heksow

export function countMovement(
  positionHexCoords: HexCoords,
  targetHexCoords: HexCoords,
) {
  const distanceQ = positionHexCoords.q - targetHexCoords.q; // roznica w osi q
  const distanceR = positionHexCoords.r - targetHexCoords.r; // roznica w osi r
  const distanceS =
    -(positionHexCoords.q + positionHexCoords.r) +
    (targetHexCoords.q + targetHexCoords.r); // os s wynikajaca z axial
  return (Math.abs(distanceQ) + Math.abs(distanceR) + Math.abs(distanceS)) / 2; // dystans heksowy (cube coords)
}

export type Road = {
  movementCost: number; // suma kosztow ruchu
  road: HexTile[]; // kolejne kafelki trasy
};
export type TileWithCostReach = {
  tile: HexTile; // kafelek
  cost: number; // koszt dojscia do kafelka
  visited: boolean; // czy juz przetworzony
};
export function roadByDijkstra(
  positionHexTile: HexTile,
  targetHexTile: HexTile,
  board: Board,
): Road | undefined {
  const tilesToCheck: TileWithCostReach[] = []; // kolejka priorytetowa (ręczna)
  const closed: HexTile[] = []; // zamkniete wezly
  const cameFrom: { tile: HexTile; prev: HexTile | null }[] = []; // poprzednik dla rekonstrukcji sciezki

  const startTile: TileWithCostReach = {
    tile: positionHexTile,
    cost: 0,
    visited: false,
  }; // start z kosztem 0

  tilesToCheck.push(startTile); // wrzuc start na liste otwartych
  cameFrom.push({ tile: positionHexTile, prev: null }); // brak poprzednika na starcie

  const same = (a: HexTile, b: HexTile) =>
    a.coords.q === b.coords.q && a.coords.r === b.coords.r; // pomocnicze porownanie koordow

  const inList = (arr: HexTile[], t: HexTile) => arr.some((x) => same(x, t)); // sprawdz czy element jest na liscie

  const getPrevEntry = (t: HexTile) => cameFrom.find((e) => same(e.tile, t)); // znajdz wejscie poprzednika

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

    if (same(current.tile, targetHexTile)) {
      const path: HexTile[] = []; // przechowywana sciezka wynikowa
      let cur: HexTile | null = current.tile;
      while (cur) {
        path.push(cur); // dodaj kafelek do sciezki
        const entry = getPrevEntry(cur); // znajdz poprzednika
        cur = entry ? entry.prev : null; // przesun wskaznik
      }
      return { movementCost: current.cost, road: path.reverse() }; // zwroc koszt i odwrocona sciezke
    }

    const neighbors: HexTile[] = getNeighbors(current.tile, board); // pobierz sasiednie przechodnie pola

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

function getNeighbors(tile: HexTile, board: Board): HexTile[] {
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
    .filter((t): t is HexTile => !!t && t.passable); // zwroc tylko istniejace i przechodnie
}
