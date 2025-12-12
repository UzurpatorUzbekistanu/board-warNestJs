import { countMovement } from './hex.utils';
import { type HexCoords } from './hex.types';

describe('countMovement', () => {
  it('liczy dystans heksowy (axial)', () => {
    const start: HexCoords = { q: 0, r: 0 };
    const target: HexCoords = { q: 2, r: -1 };

    // |2| + |-1| + |-(0+0) - (2-1)| = 2 + 1 + 1 = 4 => 4/2 = 2
    expect(countMovement(start, target)).toBe(2);
  });
});
