import { Body, Controller, Get, Param, Post } from '@nestjs/common'; // nest dekoratory
import { CreateUnitDto } from './dto/create-unit-dto'; // dto jednostki
import type { Unit, UnitName } from './domain/unit.types'; // typy jednostek
import { UnitsService } from './units.service'; // logika jednostek
import { GameUnit } from './domain/game-unit'; // implementacja jednostki
import { ApiOperation, ApiResponse } from '@nestjs/swagger'; // swagger docs
import { AttackUnitDto } from './dto/attack-unit.dto'; // dto ataku
import type { AttackResult } from './units.service'; // wynik ataku

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {} // DI serwisu jednostek

  @Post('create/:id')
  @ApiOperation({
    summary: 'Create a new unit by its name like: line-infantry',
  })
  @ApiResponse({
    status: 201,
    description: 'The unit has been successfully created.',
    type: CreateUnitDto,
  })
  createUnit(@Param('id') id: UnitName): Unit {
    const unit: GameUnit = this.unitsService.createUnitWithoutPlayer(id); // utworz instancje bez gracza

    return unit; // zwroc jednostke
  }

  @Post('attack')
  @ApiOperation({ summary: 'Perform an attack between two units (in-memory).' })
  attackUnit(@Body() body: AttackUnitDto): AttackResult {
    return this.unitsService.attack(
      body.attackerId,
      body.defenderId,
      body.mode,
    ); // rozegraj atak
  }

  @Get()
  @ApiOperation({ summary: 'Get all available unit templates' })
  @ApiResponse({
    status: 200,
    description: 'List of all available unit templates.',
    type: [CreateUnitDto],
  })
  getAllAvailableUnits(): Unit[] {
    return this.unitsService.getAllAvailableUnits(); // lista szablonow jednostek
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get unit template by its name like: line-infantry',
  })
  @ApiResponse({
    status: 200,
    description: 'The unit template.',
    type: CreateUnitDto,
  })
  getUnitById(@Param('id') id: UnitName): Unit {
    return this.unitsService.getUnitById(id); // zwroc szablon jednostki
  }
}
