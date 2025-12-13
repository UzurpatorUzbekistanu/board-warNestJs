import { Module } from '@nestjs/common'; // dekorator modulu Nest
import { JwtModule, JwtSignOptions } from '@nestjs/jwt'; // konfiguracja JWT
import { PassportModule } from '@nestjs/passport'; // integracja passport
import { AuthService } from './auth.service'; // logika auth
import { AuthController } from './auth.controller'; // endpointy auth
import { UserModule } from '../user/user.module'; // zaleznosc na user
import { JwtStrategy } from './jwt.strategy'; // strategia walidacji tokenu

@Module({
  imports: [
    UserModule, // dostep do serwisu userow
    PassportModule, // rejestracja strategii passport
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me', // klucz JWT
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
      } as JwtSignOptions, // TTL tokenu
    }),
  ],
  controllers: [AuthController], // rejestracja kontrolera
  providers: [AuthService, JwtStrategy], // serwis + strategia
  exports: [AuthService], // udostepnij serwis innym modulom
})
export class AuthModule {}
