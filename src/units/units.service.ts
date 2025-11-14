import { Injectable } from '@nestjs/common';
import { Player } from 'src/player/domain/player';
import { Unit, UnitName } from './domain/unit.types';
import { UnitFactory } from './domain/unit-factory';

@Injectable()
export class UnitsService {

    private customUnits: Unit[] = [];
    private readonly factory = new UnitFactory();

    createUnit(id: UnitName): Unit {
        const newUnit = this.factory.createFromName(id);
        this.customUnits.push(newUnit);
        return newUnit;
    }

    getPlayerUnits(playerId: Player['id']): Unit[] {
        let units: Unit[] = [];
        return units
    }

    getAllAvailableUnits(): Unit[] {
        return this.factory.getAllUnitTemplates();
    }


}
