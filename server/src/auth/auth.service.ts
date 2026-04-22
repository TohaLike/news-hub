import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument, UserRole } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name.trim(),
      role: dto.accountType as UserRole,
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

  private tokenPayload(user: UserDocument) {
    const email = user.email;
    const name =
      (user.name && user.name.trim()) ||
      email.split('@')[0] ||
      email;
    const role: UserRole = user.role ?? 'reader';
    return { sub: String(user._id), email, name, role };
  }

  async generateTokens(user: UserDocument) {
    const payload = this.tokenPayload(user);
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
    const email = user.email;
    const name =
      (user.name && user.name.trim()) ||
      email.split('@')[0] ||
      email;
    const role: UserRole = user.role ?? 'reader';
    return {
      id: String(user._id),
      email,
      name,
      role,
    };
  }
}
