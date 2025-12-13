import { IsInt, Min } from 'class-validator'; // walidacja koordow

export class SetUnitPosition {
  @IsInt()
  @Min(0)
  q: number; // wspolrzedna q
  @IsInt()
  @Min(0)
  r: number; // wspolrzedna r
  constructor(q: number, r: number) {
    this.q = q; // przypisz q
    this.r = r; // przypisz r
  }
}
