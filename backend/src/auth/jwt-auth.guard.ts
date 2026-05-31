import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: string }>();
    const authorizationHeader = request.headers['authorization'];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token .');
    }
    const token = authorizationHeader.slice('Bearer '.length);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      request.user = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalid.');
    }
  }
}
