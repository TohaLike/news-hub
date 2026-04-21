import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      password: hashedPassword,
    });
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async generateTokens(user: UserDocument) {
    const sub = String(user._id);
    const payload = { sub, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });
    await this.userService.addRefreshToken(user._id, refreshToken);
    return { accessToken, refreshToken };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const tokenExists = user.refreshTokens.includes(refreshToken);
    if (!tokenExists) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    try {
      this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Expired refresh token');
    }
    await this.userService.removeRefreshToken(userId, refreshToken);
    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken: string) {
    await this.userService.removeRefreshToken(userId, refreshToken);
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: String(user._id), email: user.email };
  }
}
