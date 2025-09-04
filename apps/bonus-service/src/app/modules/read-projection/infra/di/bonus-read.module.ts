import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BonusReadController } from 'apps/bonus-service/src/app/modules/read-projection/adapters/inbound/http/bonus-read.controller';
import { BonusReadHandler } from 'apps/bonus-service/src/app/modules/read-projection/application/bonus-read/bonus-read.query-handler';
import { bonusReadOtelConfig } from 'apps/bonus-service/src/app/modules/read-projection/infra/config/otel.config';
import { bonusReadTypeOrmOptions } from 'apps/bonus-service/src/app/modules/read-projection/infra/config/typeorm-config';
import { bonusReadWinstonConfig } from 'apps/bonus-service/src/app/modules/read-projection/infra/config/winston.config';
import { BonusReadProjection } from 'apps/bonus-service/src/app/modules/read-projection/infra/persistence/projections/bonus-read.projection';
import { BonusReadRepo } from 'apps/bonus-service/src/app/modules/read-projection/infra/persistence/repositories/bonus-read.repository';
import { BonusReadRefreshWorker } from 'apps/bonus-service/src/app/modules/read-projection/infra/workers/bonus-read-refresh.worker';
import { BONUS_READ_REFRESH_QUEUE } from 'apps/bonus-service/src/app/modules/read-projection/infra/workers/bonus-read-refresh.token';
import {
  HttpErrorInterceptor,
  KafkaErrorInterceptor,
  HttpErrorInterceptorOptions,
  KafkaErrorInterceptorOptions,
} from 'error-handling/interceptor';
import { WinstonModule } from 'nest-winston';
import { OpenTelemetryModule } from 'nestjs-otel';
import { LoggingInterceptor } from 'observability';

@Module({
  imports: [
    TypeOrmModule.forRoot(bonusReadTypeOrmOptions),

    OpenTelemetryModule.forRoot(bonusReadOtelConfig),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    BullModule.registerQueue({
      name: BONUS_READ_REFRESH_QUEUE,
    }),
    // ClientsModule.register([
    //     {
    //         name: KAFKA_PRODUCER,
    //         transport: Transport.KAFKA,
    //         options: {
    //             client: bonusReadKafkaConfig.client,
    //             producer: bonusReadKafkaConfig.producer,
    //             run: bonusReadKafkaConfig.run,
    //             consumer: bonusReadKafkaConfig.consumer
    //         },
    //     },
    // ]),

    WinstonModule.forRoot({
      transports: [
        bonusReadWinstonConfig.transports.consoleTransport,
        bonusReadWinstonConfig.transports.fileTransport,
      ],
    }),
  ],
  controllers: [BonusReadController],
  providers: [
    BonusReadHandler,
    BonusReadProjection,
    BonusReadRepo,
    BonusReadRefreshWorker,

    LoggingInterceptor,
    HttpErrorInterceptor,

    {
      provide: HttpErrorInterceptorOptions,
      useValue: {
        includeTupleInBody: false,
        retryAfterSeconds: 1,
        addNoStoreHeaders: true,
      },
    },
  ],
})
export class BonusReadModule {}
