// src/board/data/board-definition.ts
import { HexCoords, HexTile, TerrainType } from '../domain/hex.types'; // typy i enumy heksow
import GameBoard from '../domain/board'; // kontrakt na plansze gry

const BOARD_WIDTH = 30; // szerokosc planszy w heksach
const BOARD_HEIGHT = 30; // wysokosc planszy w heksach
const SEED = 12345; // deterministyczne rozmieszczenie mapy; zmien seed dla innego ukladu

type Rng = () => number; // alias na prosty generator liczb pseudolosowych

function createRng(seed: number): Rng {
  let state = seed >>> 0; // zachowujemy stan w 32-bitowym rejestrze
  return () => {
    state = (state * 1775525 + 1013904223) >>> 0; // krok LCG
    return state / 0x100000000; // normalizacja do <0,1)
  };
}

const rng = createRng(SEED); // globalny RNG do budowania mapy

const directions: HexCoords[] = [
  { q: 1, r: 0 }, // wschod
  { q: 1, r: -1 }, // polnocny wschod
  { q: 0, r: -1 }, // polnoc
  { q: -1, r: 0 }, // zachod
  { q: -1, r: 1 }, // poludniowy zachod
  { q: 0, r: 1 }, // poludnie
]; // sasiedzi heksa w axial coords

const coordKey = (q: number, r: number) => `${q},${r}`; // klucz mapy heksow
const tileMap = new Map<string, HexTile>(); // magazyn wszystkich pol

function setTile(
  q: number,
  r: number,
  terrain: TerrainType,
  passable: boolean,
  movementCost: number,
) {
  const key = coordKey(q, r); // identyfikator pola
  const tile = tileMap.get(key); // pobierz obiekt kafelka
  if (!tile) return; // ignoruj poza zakresem
  tile.terrain = terrain; // ustaw typ terenu
  tile.passable = passable; // czy jednostki moga przejsc
  tile.movementCost = movementCost; // koszt ruchu (nizszy = szybciej)
}

function neighbors(q: number, r: number): HexCoords[] {
  return directions
    .map((d) => ({ q: q + d.q, r: r + d.r })) // przesuniecie w kazdym kierunku
    .filter(
      (c) => c.q >= 0 && c.q < BOARD_WIDTH && c.r >= 0 && c.r < BOARD_HEIGHT,
    ); // tylko w obrebie planszy
}

function initBase() {
  for (let q = 0; q < BOARD_WIDTH; q++) {
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      tileMap.set(coordKey(q, r), {
        coords: { q, r }, // zapis axial
        terrain: TerrainType.Plain, // domyslnie rownina
        passable: true, // przechodzenie dozwolone
        movementCost: 1, // bazowy koszt ruchu
      });
    }
  }
}

function addLake(centerQ: number, centerR: number, radius: number): HexCoords {
  for (let q = centerQ - radius; q <= centerQ + radius; q++) {
    for (let r = centerR - radius; r <= centerR + radius; r++) {
      if (q < 0 || q >= BOARD_WIDTH || r < 0 || r >= BOARD_HEIGHT) continue; // omijamy poza plansza
      const dist = Math.abs(centerQ - q) + Math.abs(centerR - r); // prosty dystans Manhattan w axial
      if (dist <= radius * 2) {
        setTile(q, r, TerrainType.Water, false, 99); // jezioro: nieprzechodnie, ogromny koszt
      }
    }
  }
  return { q: centerQ, r: centerR }; // zwroc srodek jeziora
}

function carveRiver(): HexCoords[] {
  let q = 0; // start z lewej krawedzi
  let r = Math.floor(BOARD_HEIGHT * 0.2 + rng() * BOARD_HEIGHT * 0.6); // losowa wysokosc w srodkowym pasie
  const maxSteps = BOARD_WIDTH * 3; // limit krokow, by uniknac zapetlenia
  const path: HexCoords[] = []; // zapis trasy rzeki

  for (let step = 0; step < maxSteps && q < BOARD_WIDTH; step++) {
    setTile(q, r, TerrainType.Water, false, 99); // koryto rzeki jest nieprzechodnie
    path.push({ q, r }); // zachowaj wspolrzedne dla pozniejszych obliczen

    const choice = rng(); // decyzja o kierunku
    if (choice < 0.6) {
      q += 1; // plynie na wschod
    } else if (choice < 0.8) {
      r += rng() > 0.5 ? 1 : -1; // meandruje w pionie
    } else {
      q += 1;
      r += rng() > 0.5 ? 1 : -1; // skret ukosny
    }

    q = Math.max(0, Math.min(BOARD_WIDTH - 1, q)); // trzymamy sie planszy
    r = Math.max(0, Math.min(BOARD_HEIGHT - 1, r));
  }

  return path; // pelna sciezka rzeki
}

function connectLakeToRiver(lakeCenter: HexCoords, riverPath: HexCoords[]) {
  const nearestRiver = riverPath.reduce(
    (best, curr) => {
      const dist =
        Math.abs(curr.q - lakeCenter.q) + Math.abs(curr.r - lakeCenter.r); // dystans taksowkowy
      if (best === null) return { coord: curr, dist };
      return dist < best.dist ? { coord: curr, dist } : best; // wybieramy najblizszy punkt rzeki
    },
    null as { coord: HexCoords; dist: number } | null,
  );

  if (!nearestRiver) return; // brak rzeki do polaczenia

  let q = lakeCenter.q;
  let r = lakeCenter.r;
  const target = nearestRiver.coord; // docelowy heks rzeki

  while (q !== target.q || r !== target.r) {
    setTile(q, r, TerrainType.Water, false, 99); // wykop kanal w kierunku rzeki

    if (q !== target.q) {
      q += Math.sign(target.q - q); // przesuwaj sie w osi q
    } else if (r !== target.r) {
      r += Math.sign(target.r - r); // przesuwaj sie w osi r
    }
  }
  setTile(target.q, target.r, TerrainType.Water, false, 99); // polacz wezel koncowy
}

function seedCluster(
  terrain: TerrainType,
  seeds: number,
  maxRadius: number,
  passable: boolean,
  movementCost: number,
  spread: number,
) {
  for (let i = 0; i < seeds; i++) {
    const q = 2 + Math.floor(rng() * (BOARD_WIDTH - 4)); // start w bezpiecznym od brzegu obszarze
    const r = 2 + Math.floor(rng() * (BOARD_HEIGHT - 4));
    const frontier: { q: number; r: number; depth: number }[] = [
      { q, r, depth: 0 },
    ]; // stos dla DFS

    while (frontier.length) {
      const cur = frontier.pop()!; // pobierz nastepny heks
      setTile(cur.q, cur.r, terrain, passable, movementCost); // ustaw teren klastra
      if (cur.depth >= maxRadius) continue; // osiagnelismy maksymalny zasieg
      for (const n of neighbors(cur.q, cur.r)) {
        if (rng() < spread) {
          frontier.push({ q: n.q, r: n.r, depth: cur.depth + 1 }); // rozrost w sasiadow z szansa spread
        }
      }
    }
  }
}

function addSwampsNearWater(probability: number) {
  const waterTiles = Array.from(tileMap.values()).filter(
    (t) => t.terrain === TerrainType.Water,
  ); // znajdz wode
  for (const wt of waterTiles) {
    for (const n of neighbors(wt.coords.q, wt.coords.r)) {
      if (rng() < probability) {
        setTile(n.q, n.r, TerrainType.Swamp, true, 3); // bloto przy brzegu, wciaz przechodnie
      }
    }
  }
}

function addFords(count: number) {
  const candidates = Array.from(tileMap.values()).filter(
    (t) =>
      t.terrain === TerrainType.Water && // tylko woda
      t.coords.q > 0 &&
      t.coords.q < BOARD_WIDTH - 1 &&
      t.coords.r > 0 &&
      t.coords.r < BOARD_HEIGHT - 1, // omijamy krawedzie
  );
  for (let i = 0; i < count && candidates.length; i++) {
    const idx = Math.floor(rng() * candidates.length); // losuj kandydat
    const tile = candidates[idx];
    if (tile) {
      tile.terrain = TerrainType.Ford; // brod przez rzeke
      tile.passable = true;
      tile.movementCost = 2; // koszt ruchu wiekszy niz drogi
    }
  }
}

function carveWindingRoad(from: HexCoords, to: HexCoords, wiggle = 0.25) {
  let q = from.q;
  let r = from.r;
  const clampQ = (v: number) => Math.max(0, Math.min(BOARD_WIDTH - 1, v)); // pilnowanie granic osi q
  const clampR = (v: number) => Math.max(0, Math.min(BOARD_HEIGHT - 1, v)); // pilnowanie granic osi r

  const step = () => {
    const dq = Math.sign(to.q - q); // kierunek w osi q
    const dr = Math.sign(to.r - r); // kierunek w osi r
    const options: HexCoords[] = [
      { q: q + dq, r },
      { q, r: r + dr },
    ]; // preferowany ruch w strone celu

    // losowe skrety tylko w jednej osi
    if (rng() < wiggle) {
      if (rng() < 0.5) {
        options.push({ q: q + (rng() > 0.5 ? 1 : -1), r }); // odchylenie w q
      } else {
        options.push({ q, r: r + (rng() > 0.5 ? 1 : -1) }); // odchylenie w r
      }
    }

    options.sort(
      (a, b) =>
        Math.abs(a.q - to.q) +
        Math.abs(a.r - to.r) -
        (Math.abs(b.q - to.q) + Math.abs(b.r - to.r)),
    ); // wybierz opcje najblizsza celowi

    const next = options[0];
    q = clampQ(next.q); // wykonaj krok
    r = clampR(next.r);
  };

  while (q !== to.q || r !== to.r) {
    const key = coordKey(q, r); // aktualny heks drogi
    const tile = tileMap.get(key);
    if (tile && tile.terrain !== TerrainType.City) {
      if (tile.terrain === TerrainType.Water) {
        tile.terrain = TerrainType.Bridge; // most zamiast wody
        tile.passable = true;
        tile.movementCost = 1;
      } else if (tile.terrain === TerrainType.Ford) {
        tile.passable = true;
        tile.movementCost = Math.min(tile.movementCost, 2); // brody maja wyzszy koszt
      } else {
        tile.terrain = TerrainType.Road; // utwardzenie jako droga
        tile.passable = true;
        tile.movementCost = Math.min(tile.movementCost, 1);
      }
    }

    step(); // przesun sie dalej
  }

  const endKey = coordKey(to.q, to.r);
  const endTile = tileMap.get(endKey);
  if (endTile && endTile.terrain === TerrainType.Water) {
    endTile.terrain = TerrainType.Bridge; // zakoncz mostem jezeli laduje w wodzie
    endTile.passable = true;
    endTile.movementCost = 1;
  }
}

initBase(); // wypelnij plansze bazowa rownina
const lakeCenter = addLake(
  Math.floor(BOARD_WIDTH * 0.2),
  Math.floor(BOARD_HEIGHT * 0.7),
  2 + Math.floor(rng() * 2),
); // jezioro w dolnej lewej cwierci
const riverPath = carveRiver(); // generuj rzeke z lewej do prawej
connectLakeToRiver(lakeCenter, riverPath); // polacz jezioro z rzeka kanalem
addFords(10); // dodaj brody na rzece
seedCluster(TerrainType.Hill, 4, 3, true, 3, 0.55); // wyspy wzgorz
seedCluster(TerrainType.Forest, 8, 5, true, 2, 0.62); // rozrzucone lasy
addSwampsNearWater(0.3); // bagna przy wodzie

const citySpots: HexCoords[] = [
  { q: Math.floor(BOARD_WIDTH / 2), r: Math.floor(BOARD_HEIGHT / 2) }, // centralne miasto
  { q: 5, r: 5 }, // polnocny zachod
  { q: BOARD_WIDTH - 6, r: 8 }, // polnocny wschod
  { q: 8, r: BOARD_HEIGHT - 6 }, // poludniowy zachod
]; // z gory ustalone lokacje miast
for (const c of citySpots) {
  setTile(c.q, c.r, TerrainType.City, true, 1); // oznacz miasto: przechodnie, tani ruch
}

carveWindingRoad(citySpots[0], citySpots[1], 0.45); // drogi laczace miasta
carveWindingRoad(citySpots[0], citySpots[2], 0.4);
carveWindingRoad(citySpots[0], citySpots[3], 0.35);
carveWindingRoad(citySpots[1], citySpots[2], 0.3);
carveWindingRoad(
  citySpots[2],
  { q: BOARD_WIDTH - 2, r: Math.floor(BOARD_HEIGHT / 2) },
  0.35,
);
carveWindingRoad(
  citySpots[0],
  { q: BOARD_WIDTH - 1, r: BOARD_HEIGHT - 1 },
  0.2,
); // droga na skraj mapy

const tiles: HexTile[] = Array.from(tileMap.values()); // zbierz kafelki w tablice

export const DEFAULT_BOARD: GameBoard = {
  tiles, // statyczna plansza
  getHexTile() {
    return tiles; // prosty accessor
  },
}; // eksport domyslnego ukladu
