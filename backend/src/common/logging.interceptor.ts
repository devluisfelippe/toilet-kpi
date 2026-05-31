import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { LoggedRequest, userOf } from './request-context';
import { formatBody } from './redact';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<LoggedRequest>();
    const response = http.getResponse<Response>();

    const reqId = randomUUID().slice(0, 8);
    request.reqId = reqId;
    request.startedAt = Date.now();
    response.setHeader('X-Request-Id', reqId);

    this.logger.log(
      `→ ${request.method} ${request.originalUrl} | user=${userOf(request)} | reqId=${reqId}${formatBody(request.body)}`,
    );

    response.once('finish', () => {
      if (request.errorLogged) return;
      const ms = Date.now() - (request.startedAt ?? Date.now());
      this.logger.log(
        `← ${request.method} ${request.originalUrl} | ${response.statusCode} | ${ms}ms | user=${userOf(request)} | reqId=${reqId}`,
      );
    });

    return next.handle();
  }
}
