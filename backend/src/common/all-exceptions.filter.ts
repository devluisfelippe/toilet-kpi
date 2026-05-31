import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggedRequest, elapsedMs, userOf } from './request-context';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<LoggedRequest>();
    const response = http.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const clientBody = isHttp
      ? exception.getResponse()
      : { statusCode: status, message: 'Erro interno no trono.' };
    const logMessage = isHttp
      ? messageOf(clientBody)
      : exception instanceof Error
        ? exception.message
        : 'erro desconhecido';

    const line = `✗ ${request.method} ${request.originalUrl} | ${status} | ${elapsedMs(request)} | user=${userOf(request)} | reqId=${request.reqId ?? '-'} | msg="${logMessage}"`;

    if (status >= 500) {
      this.logger.error(
        line,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(line);
    }

    request.errorLogged = true;
    response.status(status).json(clientBody);
  }
}

function messageOf(body: unknown): string {
  if (typeof body === 'string') return body;
  if (body && typeof body === 'object' && 'message' in body) {
    const message = body.message;
    return Array.isArray(message) ? message.join('; ') : String(message);
  }
  return 'erro';
}
