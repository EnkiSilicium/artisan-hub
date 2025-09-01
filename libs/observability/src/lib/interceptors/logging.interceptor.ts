// common/app-logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { KafkaContext } from '@nestjs/microservices';
import { logInfo, logError } from '../wrappers';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const controller = context.getClass()?.name ?? 'UnknownController';
    const method = context.getHandler()?.name ?? 'unknownMethod';
    const transport = this.getTransportName(context);
    const info = this.collectContextInfo(context);
    const started = Date.now();

    // BEFORE
    logInfo(
      {
        msg: `${controller}::${method} requested`,
        controller,
        method,
        ...info,
      },
      {},
      { transport },
    );

    return next.handle().pipe(
      // AFTER SUCCESS
      tap(() => {
        logInfo(
          {
            msg: `${controller}::${method} SUCCESS`,
            controller,
            method,
            ...info,
          },
          {},
          { transport, durationMs: Date.now() - started },
        );
      }),
      // FAILURE
      catchError((error: unknown) => {
        try {
          logError(
            {
              msg: `${controller}::${method} FAILURE`,
              controller,
              method,
              error: this.toPlain(error),
              ...info,
            },
            {},
            { transport, durationMs: Date.now() - started },
          );
        } catch {
          // last-ditch fallback if someone throws a cursed object
          Logger.error(
            `${controller}::${method} FAILURE`,
            (error as any)?.stack,
            LoggingInterceptor.name,
          );
        }
        return throwError(() => error);
      }),
    );
  }

  private getTransportName(context: ExecutionContext): string {
    const type = context.getType();
    if (type === 'http') return 'http';
    if (type === 'rpc') {
      const rpcCtx: any = context.switchToRpc().getContext?.();
      if (rpcCtx instanceof KafkaContext) return 'kafka';
      const name = rpcCtx?.constructor?.name ?? '';
      if (/Kafka/i.test(name)) return 'kafka';
      if (/Nats/i.test(name)) return 'nats';
      if (/Rmq/i.test(name)) return 'rmq';
      return 'rpc';
    }
    if (type === 'ws') return 'ws';
    return String(type);
  }

  private collectContextInfo(context: ExecutionContext) {
    const wanted = [
      'commissionerId',
      'eventId',
      'workshopId',
      'orderId',
      'eventName',
    ] as const;

    const info: Record<string, unknown> = {};
    const meta: Record<string, unknown> = {};

    if (context.getType() === 'http') {
      const request: any = context.switchToHttp().getRequest?.();
      info.path = request?.originalUrl ?? request?.url;
      info.httpMethod = request?.method;
      const attempts = this.getAttempts(request);
      if (attempts !== undefined) info.attempts = attempts;

      const sources = [request?.body, request?.query, request?.params];
      for (const src of sources) {
        if (src && typeof src === 'object') {
          for (const k of wanted)
            if (k in src && src[k] !== undefined) meta[k] = src[k];
        }
      }
    } else if (context.getType() === 'rpc') {
      const data: any = context.switchToRpc().getData?.();
      if (data && typeof data === 'object') {
        for (const k of wanted)
          if (k in data && data[k] !== undefined) meta[k] = data[k];
      }
      const kctx: any = context.switchToRpc().getContext?.();
      info.topic = kctx?.getTopic?.();
      info.partition = kctx?.getPartition?.();
      const msg: any = kctx?.getMessage?.();
      info.offset = msg?.offset;
      const attempts = this.getAttempts(msg);
      if (attempts !== undefined) info.attempts = attempts;
      const headers: any = msg?.headers;
      if (headers && typeof headers === 'object') {
        for (const k of wanted) {
          const v = headers[k];
          if (v !== undefined) meta[k] = Buffer.isBuffer(v) ? v.toString() : v;
        }
      }
    }

    if (Object.keys(meta).length) info.meta = meta;
    return info;
  }

  private getAttempts(src: any): number | undefined {
    const h =
      src?.headers?.['x-attempts'] ??
      src?.headers?.['X-Attempts'] ??
      src?.headers?.['x-attempt'] ??
      src?.headers?.['X-Attempt'];
    if (h === undefined) return undefined;
    if (Buffer.isBuffer(h)) {
      const n = Number(h.toString());
      return isNaN(n) ? undefined : n;
    }
    const num = Number(h);
    return isNaN(num) ? undefined : num;
  }

  private toPlain(error: any) {
    try {
      // include non-enumerable props like 'message' and 'stack'
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
