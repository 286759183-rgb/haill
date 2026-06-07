import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService, AuthPayload } from './auth.service';
import { ROLES_KEY } from './roles.decorator';
import type { UserRole } from './domain';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService, @Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: AuthPayload }>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('请先登录');
    const payload = this.auth.verifyToken(authorization.slice('Bearer '.length));
    if (requiredRoles.length && !requiredRoles.includes(payload.role)) throw new ForbiddenException('无权限操作');
    request.user = payload;
    return true;
  }
}
