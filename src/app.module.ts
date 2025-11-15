import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitsModule } from './units/units.module';
import { PlayerModule } from './player/player.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [UnitsModule, PlayerModule, BoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
