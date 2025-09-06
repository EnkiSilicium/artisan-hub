import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KAFKA_PRODUCER, KafkaProducerPort } from 'adapter';
import { MockController } from 'apps/bonus-service/src/app/modules/bonus-processor/adapters/inbound/http/mock-controller';
import { BonusEventsConsumer } from 'apps/bonus-service/src/app/modules/bonus-processor/adapters/inbound/messaging/kafka.consumer';
import { BonusEventDispatcher } from 'apps/bonus-service/src/app/modules/bonus-processor/adapters/outbound/messaging/kafka-producer';
import { BonusEventService } from 'apps/bonus-service/src/app/modules/bonus-processor/application/services/bonus-event/bonus-event.service';
import { bonusProcessorKafkaConfig } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/config/kafka.config';
import { bonusProcessorTypeOrmOptions } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/config/typeorm-config';
import { bonusProcessorWinstonConfig } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/config/winston.config';
import { AdditiveBonusRepo } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/additive-bonus/additive-bonus.repo';
import { BonusEventRepo } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/bonus-event/bonus-event.repo';
import { VipProfileRepo } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/vip-profile/vip-profile.repo';
import {
  HttpErrorInterceptor,
  HttpErrorInterceptorOptions,
  KafkaErrorInterceptor,
  KafkaErrorInterceptorOptions,
} from 'error-handling/interceptor';
import { WinstonModule } from 'nest-winston';
import { OpenTelemetryModule } from 'nestjs-otel';
import { LoggingInterceptor } from 'observability';
import {
  outboxBullMqConfigFactory,
  OutboxModule,
  OutboxProcessor,
  OutboxService,
  TypeOrmUoW,
} from 'persistence';

@Module({
  imports: [
    TypeOrmModule.forRoot(bonusProcessorTypeOrmOptions),


    OutboxModule,

    OpenTelemetryModule.forRoot({
      metrics: {
        apiMetrics: {
          enable: true,
          defaultAttributes: {
            service: 'bonus-processor',
          },
          ignoreUndefinedRoutes: false,
          prefix: 'metrics',
        },
      },
    }),

    BullModule.registerQueue(outboxBullMqConfigFactory()),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),

    
    ClientsModule.register([
      {
        name: KAFKA_PRODUCER,
        transport: Transport.KAFKA,
        options: {
          client: bonusProcessorKafkaConfig.client,
          producer: bonusProcessorKafkaConfig.producer,
          run: bonusProcessorKafkaConfig.run,
          consumer: bonusProcessorKafkaConfig.consumer,
        },
      },
    ]),

    WinstonModule.forRoot({
      transports: [
        bonusProcessorWinstonConfig.transports.consoleTransport,
      ],
    }),
  ],
  controllers: [BonusEventsConsumer, MockController],
  providers: [
    OutboxProcessor,
    OutboxService,
    TypeOrmUoW,

    BonusEventService,
    BonusEventRepo,
    AdditiveBonusRepo,
    VipProfileRepo,
    { provide: KafkaProducerPort, useClass: BonusEventDispatcher },
    LoggingInterceptor,
    HttpErrorInterceptor,
    KafkaErrorInterceptor,
    {
      provide: HttpErrorInterceptorOptions,
      useValue: {
        includeTupleInBody: false,
        retryAfterSeconds: 1,
        addNoStoreHeaders: true,
      },
    },
    {
      provide: KafkaErrorInterceptorOptions,
      useValue: {
        maxRetries: 5,
      },
    },
  ],
})
export class BonusProcessorModule { }
