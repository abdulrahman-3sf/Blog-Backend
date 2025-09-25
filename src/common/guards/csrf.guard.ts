import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CSRF_SKIP_KEY } from '../meta/csrf-skip.decorator';

const UNSAFE = new Set(['POST','PUT','PATCH','DELETE']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req: Request = ctx.switchToHttp().getRequest();
    const method = req.method.toUpperCase();

    // Allow safe methods
    if (!UNSAFE.has(method)) return true;

    // Allow explicit skips (e.g. login)
    const skip = this.reflector.getAllAndOverride<boolean>(CSRF_SKIP_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skip) return true;

    const cookieName = process.env.CSRF_COOKIE_NAME ?? 'csrf_token';
    const headerName = (process.env.CSRF_HEADER_NAME ?? 'x-csrf-token').toLowerCase();

    const cookieVal = (req.cookies ?? {})[cookieName];
    const headerVal = (req.headers ?? {})[headerName] as string | undefined;

    if (!cookieVal || !headerVal || cookieVal !== headerVal) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}
