import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { UnitsModule } from 'src/units/units.module';

@Module({
  imports: [UnitsModule],
  providers: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}
