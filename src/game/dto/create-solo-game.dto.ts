import { IsInt, Min } from 'class-validator'; // walidacja ID gracza

export class CreateSoloGameDto {
  @IsInt() // liczba calkowita
  @Min(1) // minimalne ID
  playerId: number; // id gracza

  constructor(playerId: number) {
    this.playerId = playerId; // przypisz id
  }
}
