import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { UnitsService } from 'src/units/units.service';

@Module({
  providers: [PlayerService, UnitsService],
  controllers: [PlayerController]
})
export class PlayerModule {}
