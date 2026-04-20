// auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // async register(email: string, password: string) {
  //   const existing = await this.usersService.findByEmail(email);

  //   if (existing) {
  //     throw new BadRequestException('User already exists');
  //   }

  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   const user = await this.usersService.create({
  //     email,
  //     password: hashedPassword,
  //   });

  //   return this.generateTokens(user);
  // }

  // async login(email: string, password: string) {
  //   const user = await this.usersService.findByEmail(email);

  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   const isValid = await bcrypt.compare(password, user.password);

  //   if (!isValid) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   return this.generateTokens(user);
  // }

  // async generateTokens(user: UserDocument) {
  //   const payload = {
  //     sub: user._id,
  //     email: user.email,
  //   };

  //   const accessToken = this.jwtService.sign(payload, {
  //     expiresIn: '15m',
  //   });

  //   const refreshToken = this.jwtService.sign(payload, {
  //     expiresIn: '7d',
  //   });

  //   // сохраняем refresh token (rotation)
  //   await this.usersService.addRefreshToken(user._id, refreshToken);

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  // async refresh(userId: string, refreshToken: string) {
  //   const user = await this.usersService.findById(userId);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }

  //   const tokenExists = user.refreshTokens.includes(refreshToken);

  //   if (!tokenExists) {
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }

  //   // проверка JWT подписи
  //   try {
  //     this.jwtService.verify(refreshToken);
  //   } catch {
  //     throw new UnauthorizedException('Expired refresh token');
  //   }

  //   // удаляем старый refresh (rotation)
  //   await this.usersService.removeRefreshToken(userId, refreshToken);

  //   // выдаём новые токены
  //   return this.generateTokens(user);
  // }

  // async logout(userId: string, refreshToken: string) {
  //   await this.usersService.removeRefreshToken(userId, refreshToken);
  //   return { success: true };
  // }
}
