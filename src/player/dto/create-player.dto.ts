import { IsNotEmpty, IsString } from 'class-validator'; // walidacja prostego DTO

export class CreatePlayerDto {
  @IsString() // nazwa jako string
  @IsNotEmpty() // wymagane
  name: string;
  @IsString() // kolor jako string
  @IsNotEmpty() // wymagane
  color: string;

  constructor(name: string, color: string) {
    this.name = name; // przypisz nazwe
    this.color = color; // przypisz kolor
  }
}
