import { Injectable } from '@nestjs/common'; // wstrzykiwanie strategii
import { PassportStrategy } from '@nestjs/passport'; // baza strategii
import { Strategy, type JwtFromRequestFunction } from 'passport-jwt'; // narzedzia JWT
import { type Request } from 'express'; // typ zapytania

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtFromRequest: JwtFromRequestFunction = (req: Request) => {
      const header = req.headers?.authorization;
      if (typeof header !== 'string') return null;
      const [scheme, token] = header.split(' ');
      return scheme?.toLowerCase() === 'bearer' && token ? token : null;
    };
    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
    super({
      jwtFromRequest, // czytaj token z Bearer
      ignoreExpiration: false, // wymagaj waznego tokenu
      secretOrKey: process.env.JWT_SECRET || 'change-me', // klucz walidacji
    });
    /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
  }

  validate(payload: { sub: number; email: string }) {
    return { userId: payload.sub, email: payload.email }; // user obiekt ladowany do req.user
  }
}
