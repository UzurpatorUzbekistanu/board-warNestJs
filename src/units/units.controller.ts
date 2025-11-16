import { Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit-dto';
import type { Unit, UnitName } from './domain/unit.types';
import { UnitsService } from './units.service';
import { GameUnit } from './domain/game-unit';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('units')
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) {}

    @Post('create/:id')
    @ApiOperation({ summary: 'Create a new unit by its name like: line-infantry' })
    @ApiResponse({ status: 201, description: 'The unit has been successfully created.', type: CreateUnitDto })
    createUnit(@Param('id') id: UnitName ): Unit {
        
        const unit: GameUnit =this.unitsService.createUnitWithoutPlayer(id);

        return unit
    }

    @Get()
    @ApiOperation({ summary: 'Get all available unit templates' })
    @ApiResponse({ status: 200, description: 'List of all available unit templates.', type: [CreateUnitDto] })
    getAllAvailableUnits(): Unit[] {
        return this.unitsService.getAllAvailableUnits();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get unit template by its name like: line-infantry' })
    @ApiResponse({ status: 200, description: 'The unit template.', type: CreateUnitDto })
    getUnitById(@Param('id') id: UnitName ): Unit {
        return this.unitsService.getUnitById(id);
    }
}
