import { countMovement } from './square.utils';
import { type SquareCoords } from './square.types';

describe('countMovement', () => {
  it('liczy dystans manhattan na planszy kwadratowej', () => {
    const start: SquareCoords = { q: 0, r: 0 };
    const target: SquareCoords = { q: 2, r: -1 };

    // |2| + |-1| = 3
    expect(countMovement(start, target)).toBe(3);
  });
});
