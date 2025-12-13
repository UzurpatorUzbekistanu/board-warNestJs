import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'; // nest dekoratory
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ochrona JWT
import { StatsService } from './stats.service'; // serwis statystyk
import { RecordBattleDto } from './dto/record-battle.dto'; // dto zapisu bitwy

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {} // DI serwisu

  @Post('record')
  record(
    @Req() req: { user: { userId: number } },
    @Body() dto: RecordBattleDto,
  ) {
    return this.statsService.recordBattle(req.user.userId, dto); // zapisz wynik bitwy
  }

  @Get()
  getStats(@Req() req: { user: { userId: number } }) {
    return this.statsService.getUserStats(req.user.userId); // zwroc statystyki usera
  }
}
