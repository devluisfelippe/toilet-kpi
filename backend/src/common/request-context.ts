import { Request } from 'express';

export interface LoggedRequest extends Request {
  reqId?: string;
  startedAt?: number;
  errorLogged?: boolean;
  user?: string;
}

export function userOf(request: LoggedRequest): string {
  return typeof request.user === 'string' ? request.user : 'anon';
}

export function elapsedMs(request: LoggedRequest): string {
  return request.startedAt != null
    ? `${Date.now() - request.startedAt}ms`
    : '?';
}
