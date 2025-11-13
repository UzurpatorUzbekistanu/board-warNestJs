import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitsModule } from './units/units.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [UnitsModule, PlayerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
