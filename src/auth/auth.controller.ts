import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'; // dekoratory kontrolera
import { AuthService } from './auth.service'; // logika auth
import { RegisterDto } from './dto/register.dto'; // dane rejestracji
import { LoginDto } from './dto/login.dto'; // dane logowania
import { JwtAuthGuard } from './jwt-auth.guard'; // guard JWT

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {} // DI serwisu auth

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto); // tworzy usera i zwraca token
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto); // waliduje dane i zwraca token
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { userId: number } }) {
    return this.authService.me(req.user.userId); // zwraca dane biezacego usera
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return { success: true }; // stateless logout (po stronie klienta wyrzuc token)
  }
}
