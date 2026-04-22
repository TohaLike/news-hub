import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

const REFRESH_COOKIE = 'refresh_token';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req.cookies as Record<string, string> | undefined;
          const raw = cookies?.[REFRESH_COOKIE];
          return typeof raw === 'string' ? raw : null;
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: { sub: string; email: string; name?: string; role?: string },
  ) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token =
      typeof cookies?.[REFRESH_COOKIE] === 'string'
        ? cookies[REFRESH_COOKIE]
        : '';
    return {
      userId: payload.sub,
      refreshToken: token,
    };
  }
}
