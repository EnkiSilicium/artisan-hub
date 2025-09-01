// common/http-app-error.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { logError } from 'observability';

import { AppError } from 'error-handling/error-core';
import { DomainError } from 'error-handling/error-core';
import { InfraError } from 'error-handling/error-core';
import { ProgrammerError } from 'error-handling/error-core';

export class HttpErrorInterceptorOptions {
  /** Include { kind, service, code, v } in JSON body for callers that forward across services */
  includeTupleInBody?: boolean;
  /**
   * If error.retryable is true, set Retry-After header (seconds).
   * RFC says only some status codes are “standard” for this header, but upstreams cope.
   */
  retryAfterSeconds?: number;
  /** Also add basic no-store headers on errors to prevent caching */
  addNoStoreHeaders?: boolean;
};

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  constructor(
    private readonly opts: HttpErrorInterceptorOptions = {
      includeTupleInBody: false,
      retryAfterSeconds: 1,
      addNoStoreHeaders: true,
    },
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Only HTTP traffic; let Kafka/RPC be handled by their own interceptor.
    if (context.getType() !== 'http') return next.handle();

    return next.handle().pipe(
      catchError((err: unknown) => {
        const http = context.switchToHttp();
        const req = http.getRequest<any>();
        const res = http.getResponse<any>();
        const attempts = this.getAttempts(req);

        const baseLog: Record<string, unknown> = {
          path: req?.originalUrl ?? req?.url,
          httpMethod: req?.method,
        };
        if (attempts !== undefined) baseLog.attempts = attempts;

        // If headers are already sent, we can’t safely write a response; rethrow and let Nest’s default handler scream.
        if (this.headersSent(res)) {
          throw err;
        }

        const isAppError =
          err instanceof DomainError ||
          err instanceof InfraError ||
          err instanceof ProgrammerError;

        if (!isAppError) {
          logError({
            msg: 'HTTP handler failure',
            ...baseLog,
            retryable: false,
            error: this.toPlain(err),
          });
          // Unknown exception → 500 with a succinct body. Do not leak stack.
          this.maybeNoStore(res);
          this.setContentTypeJson(res);
          this.setStatus(res, HttpStatus.INTERNAL_SERVER_ERROR);
          this.sendJson(res, {
            message: 'Unexpected error',
            retryable: false,
          });
          return EMPTY;
        }

        const e = err as AppError;

        logError({
          msg: 'HTTP handler failure',
          ...baseLog,
          retryable: e.retryable,
          kind: e.kind,
          service: e.service,
          code: e.code,
          v: e.v,
          details: e.details,
          error: this.toPlain(e),
        });

        // Status precedence: explicit httpStatus on the error, otherwise sensible defaults by error class.
        const status =
          e.httpStatus ??
          (e instanceof DomainError
            ? HttpStatus.BAD_REQUEST
            : e instanceof InfraError
            ? HttpStatus.SERVICE_UNAVAILABLE
            : HttpStatus.INTERNAL_SERVER_ERROR);

        // Advertise retry via standard header when caller can actually do something about it.
        if (e.retryable) {
          this.setHeader(res, 'Retry-After', String(this.opts.retryAfterSeconds ?? 1));
        }

        this.maybeNoStore(res);
        this.setContentTypeJson(res);
        this.setStatus(res, status);

        const body: Record<string, unknown> = {
          message: e.message,
          retryable: e.retryable,
          details: e.details ?? undefined, // your errors are already JSON-safe
        };

        if (this.opts.includeTupleInBody) {
          body["error"] = { kind: e.kind, service: e.service, code: e.code };
          body["v"] = e.v;
        }

        this.sendJson(res, body);
        return EMPTY; // short-circuit the pipeline; we already wrote the response
      }),
    );
  }


  private headersSent(res: any): boolean {
    // Express: res.headersSent; Fastify: res.sent
    return Boolean(res?.headersSent ?? res?.sent);
  }

  private setStatus(res: any, code: number) {
    // Express: res.status(code); Fastify: res.status(code) or res.code(code)
    if (typeof res.status === 'function') return res.status(code);
    if (typeof res.code === 'function') return res.code(code);
  }

  private setHeader(res: any, name: string, value: string) {
    // Express: res.setHeader; Fastify: res.header
    if (typeof res.setHeader === 'function') return res.setHeader(name, value);
    if (typeof res.header === 'function') return res.header(name, value);
  }

  private setContentTypeJson(res: any) {
    // If a custom content-type is already set, don’t stomp it.
    const current =
      (typeof res.getHeader === 'function' && res.getHeader('content-type')) ||
      (typeof res.get === 'function' && res.get('content-type'));
    if (!current) this.setHeader(res, 'Content-Type', 'application/json; charset=utf-8');
  }

  private maybeNoStore(res: any) {
    if (!this.opts.addNoStoreHeaders) return;
    // Don’t let CDNs or intermediaries cache error responses.
    this.setHeader(res, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    this.setHeader(res, 'Pragma', 'no-cache');
    this.setHeader(res, 'Expires', '0');
    this.setHeader(res, 'Surrogate-Control', 'no-store');
  }

  private sendJson(res: any, body: unknown) {
    // Express: res.json; Fastify: res.send
    if (typeof res.json === 'function') return res.json(body);
    if (typeof res.send === 'function') return res.send(body);
  }

  private getAttempts(req: any): number | undefined {
    const h =
      req?.headers?.['x-attempts'] ??
      req?.headers?.['X-Attempts'] ??
      req?.headers?.['x-attempt'] ??
      req?.headers?.['X-Attempt'];
    if (h === undefined) return undefined;
    const num = Number(Array.isArray(h) ? h[0] : h);
    return isNaN(num) ? undefined : num;
  }

  private toPlain(error: any) {
    try {
      return JSON.parse(
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
    } catch {
      return {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      };
    }
  }
}
