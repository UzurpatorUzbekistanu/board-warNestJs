import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitsModule } from './units/units.module';
import { PlayerModule } from './player/player.module';
import { BoardModule } from './board/board.module';
import { GameModule } from './game/game.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UnitsModule, PlayerModule, BoardModule, GameModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
