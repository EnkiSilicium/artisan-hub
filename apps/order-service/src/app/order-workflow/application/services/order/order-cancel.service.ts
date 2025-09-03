import { Injectable } from '@nestjs/common';
import { WorkshopInvitationTrackerPort } from 'apps/order-service/src/app/order-workflow/application/ports/initialize-tracker.port';
import { WorkshopPort } from 'apps/order-service/src/app/order-workflow/application/ports/workshop.port';
import { OrderInitCommand } from 'apps/order-service/src/app/order-workflow/application/services/order/order-init.command';
import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import { RequestEntity } from 'apps/order-service/src/app/order-workflow/domain/entities/request/request.entity';
import { WorkshopInvitation } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.entity';
import { OrderRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/order/order.repo';
import { RequestRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/request/request.repo';
import { WorkshopInvitationRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/workshop-invitation/workshop-invitation.repo';
import { TypeOrmUoW, enqueueOutbox } from 'persistence';
import { OrderCancelledEventV1, OrderPlacedEventV1 } from 'contracts';
import { randomUUID } from 'crypto';
import { isoNow } from 'shared-kernel';
import { assert } from 'console';
import { assertIsFound } from 'apps/order-service/src/app/order-workflow/domain/entities/common/assert-is-found.assertion';


export class OrderCancelCommand {
    orderId: string;
    cancelledBy: string;
    reason: string;
    order?: Order;
}

@Injectable()
export class OrderCancelService {
    constructor(
        public readonly uow: TypeOrmUoW,
        private readonly orderRepo: OrderRepo,
    ) { }
    async orderCancel(cmd: OrderCancelCommand) {
        return this.uow.runWithRetry({}, async () => {
            const order = cmd.order ?? await this.orderRepo.findById(cmd.orderId);

            assertIsFound(order, Order, {
                orderId: cmd.orderId,
            });

            order.cancelOrder();

            await this.orderRepo.update(order);
            
            const eventPayload: OrderCancelledEventV1 = {
                eventName: 'OrderCancelled',
                orderId: order.orderId,
                cancelledBy: order.createdAt,
                schemaV: 1,
                reason: cmd.reason || 'No reason provided',
                cancelledAt: isoNow(),
            };
            enqueueOutbox({
                id: randomUUID(),
                createdAt: isoNow(),
                payload: {
                    ...eventPayload,
                },
            });
        });
    }
}
