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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const controller = context.getClass()?.name ?? 'UnknownController';
    const method = context.getHandler()?.name ?? 'unknownMethod';
    const transport = this.getTransportName(context);
    const meta = this.extractMeta(context);
    const started = Date.now();

    // BEFORE
    this.logger.log({
      msg: `${controller}::${method} requested via ${transport}`,
      controller,
      method,
      transport,
      meta,
    } as any);

    return next.handle().pipe(
      // AFTER SUCCESS
      tap(() => {
        this.logger.log({
          msg: `${controller}::${method} SUCCESS`,
          controller,
          method,
          transport,
          durationMs: Date.now() - started,
          meta,
        } as any);
      }),
      // FAILURE
      catchError((error: unknown) => {
        try {
          this.logger.error({
            msg: `${controller}::${method} FAILURE`,
            controller,
            method,
            transport,
            durationMs: Date.now() - started,
            meta,
            error: this.toPlain(error),
          } as any);
        } catch {
          // last-ditch fallback if someone throws a cursed object
          this.logger.error(
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

  private extractMeta(context: ExecutionContext) {
    const wanted = [
      'commissionerId',
      'eventId',
      'workshopId',
      'orderId',
      'eventName',
    ] as const;
    const out: Record<string, unknown> = {};

    if (context.getType() === 'http') {
      const request: any = context.switchToHttp().getRequest?.();
      const sources = [request?.body, request?.query, request?.params];
      for (const src of sources) {
        if (src && typeof src === 'object') {
          for (const k of wanted)
            if (k in src && src[k] !== undefined) out[k] = src[k];
        }
      }
    }
    else if (context.getType() === 'rpc') {
      const data: any = context.switchToRpc().getData?.();
      if (data && typeof data === 'object') {
        for (const k of wanted)
          if (k in data && data[k] !== undefined) out[k] = data[k];
      }
      // Kafka headers (first level only)
      const kctx: any = context.switchToRpc().getContext?.();
      const msg: any = kctx?.getMessage?.();
      const headers: any = msg?.headers;
      if (headers && typeof headers === 'object') {
        for (const k of wanted) {
          const v = headers[k];
          if (v !== undefined) out[k] = Buffer.isBuffer(v) ? v.toString() : v;
        }
      }
    }

    return Object.keys(out).length ? out : undefined;
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
