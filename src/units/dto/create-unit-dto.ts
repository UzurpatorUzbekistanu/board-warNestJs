import { ApiProperty } from '@nestjs/swagger'; // dokumentacja pola
import { IsInt, IsString } from 'class-validator'; // walidatory
import * as unitTypes from '../domain/unit.types'; // typy jednostek

export class CreateUnitDto {
  @ApiProperty() // opis w swaggerze
  @IsString() // nazwa jako string
  name: string;
  @ApiProperty()
  @IsString() // id jednostki jako string
  id: unitTypes.UnitName;
  @ApiProperty()
  @IsInt() // liczba HP
  maxHp: number;
  @ApiProperty()
  @IsInt() // atak wrecz
  meleeAttack: number;
  @ApiProperty()
  @IsInt() // atak dystansowy
  rangedAttack: number;
  @ApiProperty()
  @IsInt() // zasieg
  attackRange: number;
  @ApiProperty()
  @IsInt() // obrona
  defense: number;
  @ApiProperty()
  @IsInt() // szybkosc ruchu
  speed: number;
  @ApiProperty()
  @IsInt() // koszt jednostki
  cost: number;

  constructor(
    name: string,
    id: unitTypes.UnitName,
    maxHp: number,
    meleeAttack: number,
    rangedAttack: number,
    attackRange: number,
    defense: number,
    speed: number,
    cost: number,
  ) {
    this.name = name; // ustaw nazwe
    this.id = id; // ustaw id
    this.maxHp = maxHp; // hp
    this.meleeAttack = meleeAttack; // walka wrecz
    this.rangedAttack = rangedAttack; // walka dystansowa
    this.attackRange = attackRange; // zasieg
    this.defense = defense; // obrona
    this.speed = speed; // szybkosc
    this.cost = cost; // koszt
  }
}
