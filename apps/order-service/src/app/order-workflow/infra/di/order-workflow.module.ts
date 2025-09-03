import { CanActivate, Module, UseInterceptors } from '@nestjs/common';
import { OpenTelemetryModule } from 'nestjs-otel';
import { WinstonModule } from 'nest-winston';
import { OrderInitService } from 'apps/order-service/src/app/order-workflow/application/services/order/order-init.service';
import { RequestEditService } from 'apps/order-service/src/app/order-workflow/application/services/request/request-edit.service';
import { StageCompletionService } from 'apps/order-service/src/app/order-workflow/application/services/stage/stage-completion.service';
import { WorkshopInvitationEditService } from 'apps/order-service/src/app/order-workflow/application/services/workshop/workshop-invitation-edit.service';
import { WorkshopInvitationResponseService } from 'apps/order-service/src/app/order-workflow/application/services/workshop/workshop-invitation-response.service';
import { WorkshopInvitationResponseController } from 'apps/order-service/src/app/order-workflow/adapters/inbound/http/workshop-invitation-response.controller';
import { OrderInitController } from 'apps/order-service/src/app/order-workflow/adapters/inbound/http/order-init.controller';
import { StageCompletionController } from 'apps/order-service/src/app/order-workflow/adapters/inbound/http/stage-completion.controller';
import { RequestRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/request/request.repo';
import { OrderRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/order/order.repo';
import { StagesAggregateRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/stage/stage.repo';
import { WorkshopInvitationRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/workshop-invitation/workshop-invitation.repo';
import { WorkshopInvitationTrackerPort } from 'apps/order-service/src/app/order-workflow/application/ports/initialize-tracker.port';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderWorkflowTypeOrmOptions } from 'apps/order-service/src/app/order-workflow/infra/config/typeorm-config';
import { TypeOrmUoW } from 'persistence';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { orderWorkflowOtelConfig } from 'apps/order-service/src/app/order-workflow/infra/config/otel.config';
import { orderWorkflowWinstonConfig } from 'apps/order-service/src/app/order-workflow/infra/config/winston.config';
import { orderWorkflowKafkaConfig } from 'apps/order-service/src/app/order-workflow/infra/config/kafka.config';
import { KAFKA_PRODUCER } from 'persistence';
import { OrderEventDispatcher } from 'apps/order-service/src/app/order-workflow/adapters/outbound/messaging/kafka-producer';
import { KafkaProducerPort } from 'adapter';
import { WorkshopMockAdapter } from 'apps/order-service/src/app/order-workflow/adapters/outbound/http-clients/workshop.adapter';
import { WorkshopPort } from 'apps/order-service/src/app/order-workflow/application/ports/workshop.port';
import { WorkshopInvitationTracker } from 'apps/order-service/src/app/order-workflow/infra/workshop-invitation-tracker/workshop-invitation-tracker.service';
import { WorkshopInvitationTrackerAdapter } from 'apps/order-service/src/app/order-workflow/adapters/outbound/internal/workshop-invitation-tracker.adapter';
import { WorkshopInvitationTrackerKafkaController } from 'apps/order-service/src/app/order-workflow/adapters/inbound/messaging/workshop-invitation-tracker.kafka';

import { LoggingInterceptor } from 'observability';
import {
    HttpErrorInterceptor,
    HttpErrorInterceptorOptions,
    KafkaErrorInterceptor,
    KafkaErrorInterceptorOptions,
} from 'error-handling/interceptor';
import { PassportModule } from '@nestjs/passport';
import { OrderHttpJwtGuard } from 'apps/order-service/src/app/order-workflow/infra/auth/guards/order-http-jwt.guard';
import { JwtStrategy } from 'apps/order-service/src/app/order-workflow/infra/auth/strategies/jwt.strategy';
import { extractBoolEnv } from 'shared-kernel';
import { MockAuthGuard } from 'apps/order-service/src/app/order-workflow/infra/auth/guards/mock-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forRoot(OrderWorkflowTypeOrmOptions),

        OpenTelemetryModule.forRoot(orderWorkflowOtelConfig),
        ClientsModule.register([
            {
                name: KAFKA_PRODUCER,
                transport: Transport.KAFKA,
                options: {
                    client: orderWorkflowKafkaConfig.client,
                    producer: orderWorkflowKafkaConfig.producer,
                    run: orderWorkflowKafkaConfig.run,
                    consumer: orderWorkflowKafkaConfig.consumer,
                },
            },
        ]),


        ...(extractBoolEnv(process.env.DISABLE_AUTH)
            ? []
            : [PassportModule.register({ defaultStrategy: 'jwt', session: false })]),

        WinstonModule.forRoot({
            transports: [
                orderWorkflowWinstonConfig.transports.consoleTransport,
                orderWorkflowWinstonConfig.transports.fileTransport,
            ],
        }),
    ],
    controllers: [
        OrderInitController,
        WorkshopInvitationResponseController,
        StageCompletionController,
        WorkshopInvitationTrackerKafkaController,
    ],

    providers: [
        OrderInitService,
        RequestEditService,
        StageCompletionService,
        WorkshopInvitationEditService,
        WorkshopInvitationResponseService,

        TypeOrmUoW,

        RequestRepo,
        OrderRepo,
        StagesAggregateRepo,
        WorkshopInvitationRepo,

        WorkshopInvitationTracker,
        {
            provide: WorkshopInvitationTrackerPort,
            useClass: WorkshopInvitationTrackerAdapter,
        },
        { provide: KafkaProducerPort, useClass: OrderEventDispatcher },
        { provide: WorkshopPort, useClass: WorkshopMockAdapter },

        LoggingInterceptor,
        HttpErrorInterceptor,
        KafkaErrorInterceptor,



        ...(extractBoolEnv(process.env.DISABLE_AUTH)
            ? []
            : [JwtStrategy]),
        {
            provide: OrderHttpJwtGuard,
            useClass: extractBoolEnv(process.env.DISABLE_AUTH)
                ? MockAuthGuard
                : OrderHttpJwtGuard,
        },


        
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
export class OrderWorkflowModule { }
