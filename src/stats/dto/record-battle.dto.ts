import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'; // walidatory rekordow
import {
  type BattleResult,
  BattleResult as BattleResultEnum,
} from '@prisma/client'; // typ + wartosci enumu

export class RecordBattleDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  gameId?: number; // opcjonalny id gry

  @IsEnum(BattleResultEnum)
  result!: BattleResult; // wynik (win/lose/draw)

  @IsInt()
  @Min(0)
  damageDealt!: number; // zadane obrazenia

  @IsInt()
  @Min(0)
  damageTaken!: number; // otrzymane obrazenia

  @IsArray()
  @IsString({ each: true })
  units!: string[]; // lista jednostek w bitwie
}
