import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { OrderHistoryController } from "apps/order-service/src/app/read-model/adapters/http/order-history.controller";
import { OrderStagesReadService } from "apps/order-service/src/app/read-model/application/query-handlers/history.query-handler";
import { orderReadOtelConfig } from "apps/order-service/src/app/read-model/infra/config/otel.config";
import { OrderReadTypeOrmOptions } from "apps/order-service/src/app/read-model/infra/config/typeorm-config";
import { orderReadWinstonConfig } from "apps/order-service/src/app/read-model/infra/config/winston.config";
import { OrderHistoryProjection } from "apps/order-service/src/app/read-model/infra/persistence/projections/order-histrory.projection";
import { OrderStageFlatRepo } from "apps/order-service/src/app/read-model/infra/persistence/repositories/order-history.repository";
import { OrderHistoryRefreshJob } from "apps/order-service/src/app/read-model/infra/jobs/order-history-refresh.job";
import { HttpErrorInterceptor, KafkaErrorInterceptor, HttpErrorInterceptorOptions, KafkaErrorInterceptorOptions } from "error-handling/interceptor";
import { WinstonModule } from "nest-winston";
import { OpenTelemetryModule } from "nestjs-otel";
import { LoggingInterceptor } from "observability";



@Module({
    imports: [
        TypeOrmModule.forRoot(OrderReadTypeOrmOptions),

        OpenTelemetryModule.forRoot(orderReadOtelConfig),

        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT || 6379),
            },
        }),
        BullModule.registerQueue({
            name: 'order-history-refresh',
        }),

        WinstonModule.forRoot({
            transports: [
                orderReadWinstonConfig.transports.consoleTransport,
                orderReadWinstonConfig.transports.fileTransport
            ],

        }),
    ],
    controllers: [
        OrderHistoryController,



    ],
    providers: [
        OrderStageFlatRepo,
        OrderStagesReadService,
        OrderHistoryProjection,
        OrderHistoryRefreshJob,


        LoggingInterceptor,
        HttpErrorInterceptor,

        {
            provide: HttpErrorInterceptorOptions, useValue: {
                includeTupleInBody: false,
                retryAfterSeconds: 1,
                addNoStoreHeaders: true,
            }
        },


    ]

})
export class OrderReadModule { }




