import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type {
  AuthenticatedUser,
  JwtTokenPayload,
} from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const token = this.extractToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>(
            'auth.accessTokenSecret',
          ),
        },
      );

      if (payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      request.user = {
        accountId: payload.sub,
        roles: payload.roles,
        staffCode: payload.staffCode,
        staffId: payload.staffId,
        tokenId: payload.jti,
        username: payload.username,
      };
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }

    return true;
  }

  private extractToken(header?: string): string | null {
    if (!header) {
      return null;
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
