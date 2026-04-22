import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from 'src/user/schemas/user.schema';

type JwtPayload = {
  sub: string;
  email: string;
  name?: string;
  role?: UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    const email = payload.email;
    return {
      userId: payload.sub,
      email,
      name: payload.name?.trim() || email.split('@')[0] || email,
      role: (payload.role ?? 'reader') as UserRole,
    };
  }
}
