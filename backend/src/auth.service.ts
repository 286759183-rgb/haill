import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { User, UserRole } from './domain';
import { RegisterDto } from './dto';
import { StoreService } from './store.service';

export interface AuthPayload {
  sub: number;
  role: UserRole;
  phone: string;
}

@Injectable()
export class AuthService {
  private readonly secret = process.env.JWT_SECRET || 'haill-dev-secret-change-me';

  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  async register(dto: RegisterDto) {
    const user = await this.store.createAuthUser(dto, this.hashPassword(dto.password));
    return this.authResponse(user);
  }

  async login(phone: string, password: string) {
    const user = await this.store.findUserByPhone(phone);
    if (!user) throw new UnauthorizedException('手机号或密码错误');
    const passwordHash = await this.store.getPasswordHash(user.id);
    if (!passwordHash || passwordHash !== this.hashPassword(password)) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    return this.authResponse(user);
  }

  verifyToken(token: string): AuthPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('登录已失效');
    const [header, payload, signature] = parts;
    const expected = this.sign(`${header}.${payload}`);
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw new UnauthorizedException('登录已失效');
    }
    try {
      return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthPayload;
    } catch {
      throw new UnauthorizedException('登录已失效');
    }
  }

  private authResponse(user: User) {
    return {
      user,
      accessToken: this.issueToken({ sub: user.id, role: user.role, phone: user.phone }),
      tokenType: 'Bearer',
    };
  }

  private issueToken(payload: AuthPayload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${header}.${body}.${this.sign(`${header}.${body}`)}`;
  }

  private sign(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private hashPassword(password: string) {
    if (password.length < 6) throw new BadRequestException('密码至少6位');
    return createHmac('sha256', this.secret).update(password).digest('hex');
  }
}
