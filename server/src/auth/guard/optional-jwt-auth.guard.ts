import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type JwtRequestUser = {
  userId: string;
  email: string;
  name: string;
  role: string;
};

type JwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
};

/**
 * Не требует токен; если Bearer валиден — заполняет req.user (как у JwtAuthGuard).
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<
      Request & { user?: JwtRequestUser }
    >();
    const header = req.headers.authorization;
    const token =
      typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7).trim()
        : null;
    if (!token) {
      return true;
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      const email = payload.email ?? '';
      const name =
        (payload.name && String(payload.name).trim()) ||
        email.split('@')[0] ||
        email;
      req.user = {
        userId: payload.sub,
        email,
        name,
        role: (payload.role ?? 'reader') as string,
      };
    } catch {
      // опциональная авторизация — невалидный токен игнорируем
    }
    return true;
  }
}
