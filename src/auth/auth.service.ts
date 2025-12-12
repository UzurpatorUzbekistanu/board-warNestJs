import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'; // bledy i DI
import { JwtService } from '@nestjs/jwt'; // generowanie JWT
import * as bcrypt from 'bcryptjs'; // hashowanie i weryfikacja hasel
import { UserService } from '../user/user.service'; // operacje na uzytkownikach
import { RegisterDto } from './dto/register.dto'; // payload rejestracji
import { LoginDto } from './dto/login.dto'; // payload logowania

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService, // serwis uzytkownikow
    private readonly jwtService: JwtService, // serwis JWT
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email); // sprawdz czy email zajety
    if (existing) {
      throw new ConflictException('Email is already registered'); // zwroc 409 gdy istnieje
    }
    const passwordHash = await bcrypt.hash(dto.password, 10); // hashowanie hasla
    const { user } = await this.userService.createWithPlayer(dto, passwordHash); // utworz usera+player
    const token = this.signToken(user.id, user.email); // wygeneruj token

    return {
      accessToken: token, // JWT do autoryzacji
      user: this.userService.toSafeUser(user), // zwroc bez wrazliwych danych
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email); // pobierz usera po email
    if (!user) {
      throw new UnauthorizedException('Invalid credentials'); // brak usera
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash); // walidacja hasla
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials'); // zle haslo
    }

    const token = this.signToken(user.id, user.email); // nowy token
    return {
      accessToken: token, // JWT
      user: this.userService.toSafeUser(user), // bez hasha
    };
  }

  async me(userId: number) {
    const user = await this.userService.findById(userId); // pobierz usera po id
    if (!user) {
      throw new NotFoundException('User not found'); // 404 dla braku usera
    }
    return this.userService.toSafeUser(user); // zwroc bez hasha
  }

  signToken(userId: number, email: string) {
    return this.jwtService.sign({
      sub: userId,
      email, // standardowe pole email
    });
  }
}
