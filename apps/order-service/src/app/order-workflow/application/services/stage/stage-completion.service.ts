import { Injectable } from '@nestjs/common';
import {
  AcceptCompletionMarkedCommand,
  ConfirmStageCompletionCommand,
} from 'apps/order-service/src/app/order-workflow/application/services/workshop/workshop-invitation-edit.command';
import { assertIsFound } from 'apps/order-service/src/app/order-workflow/domain/entities/common/assert-is-found.assertion';
import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import { StagesAggregate } from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity';
import { OrderRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/order/order.repo';
import { StagesAggregateRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/stage/stage.repo';
import { TypeOrmUoW, enqueueOutbox } from 'persistence';
import {
  StageConfirmationMarkedEventV1,
  StageConfirmedEventV1,
  AllStagesCompletedEventV1,
} from 'contracts';
import { randomUUID } from 'crypto';
import { isoNow } from 'shared-kernel';

@Injectable()
export class StageCompletionService {
  constructor(
    public readonly uow: TypeOrmUoW,
    private readonly ordersRepo: OrderRepo,
    private readonly stagesAggregateRepo: StagesAggregateRepo,
  ) {}
  async acceptCompletionMarked(cmd: AcceptCompletionMarkedCommand) {
    return this.uow.runWithRetry({}, async () => {
      const stages = await this.stagesAggregateRepo.findByWorkshopInvitation({
        orderId: cmd.orderId,
        workshopId: cmd.workshopId,
      });

      assertIsFound(stages, StagesAggregate, {
        orderId: cmd.orderId,
        commissionerId: cmd.commissionerId,
        workshopId: cmd.workshopId,
      });

      const { allCompleted, stageCompleted } = stages.acceptCompletionMarked({
        stageName: cmd.payload.stageName,
      });

      this.stagesAggregateRepo.save(stages);

      if (allCompleted) {
        const order = await this.ordersRepo.findById(cmd.orderId);
        assertIsFound(order, Order, {
          orderId: cmd.orderId,
          commissionerId: cmd.commissionerId,
          workshopId: cmd.workshopId,
        });

        order.complete();

        const stageMarkedEventPayload: StageConfirmationMarkedEventV1 = {
          commissionerID: order.commissionerId,
          confirmedAt: isoNow(),
          eventName: 'StageConfirmationMarked',
          orderID: order.orderId,
          schemaV: 1,
          stageName: cmd.payload.stageName,
          workshopID: cmd.workshopId,
        };
        enqueueOutbox({
          id: randomUUID(),
          createdAt: isoNow(),
          payload: {
            ...stageMarkedEventPayload,
          },
        });

        if (stageCompleted) {
          const stageConfirmedEventPayload: StageConfirmedEventV1 = {
            commissionerID: order.commissionerId,
            confirmedAt: isoNow(),
            eventName: 'StageConfirmed',
            orderID: order.orderId,
            schemaV: 1,
            stageName: cmd.payload.stageName,
            workshopID: cmd.workshopId,
          };
          enqueueOutbox({
            id: randomUUID(),
            createdAt: isoNow(),
            payload: {
              ...stageConfirmedEventPayload,
            },
          });
        }

        if (allCompleted) {
          const allStageConfirmedEventPayload: AllStagesCompletedEventV1 = {
            commissionerID: order.commissionerId,
            completedAt: isoNow(),
            eventName: 'AllStagesCompleted',
            orderID: order.orderId,
            schemaV: 1,
            workshopID: cmd.workshopId,
          };
          enqueueOutbox({
            id: randomUUID(),
            createdAt: isoNow(),
            payload: {
              ...allStageConfirmedEventPayload,
            },
          });
        }
      }
    });
  }

  async confirmCompletion(cmd: ConfirmStageCompletionCommand) {
    return this.uow.runWithRetry({}, async () => {
      const order = await this.ordersRepo.findById(cmd.orderId);

      assertIsFound(order, Order, {
        orderId: cmd.orderId,
        commissionerId: cmd.commissionerId,
        workshopId: cmd.workshopId,
      });

      const stages = await this.stagesAggregateRepo.findByWorkshopInvitation({
        orderId: cmd.orderId,
        workshopId: cmd.workshopId,
      });
      assertIsFound(stages, StagesAggregate, {
        orderId: cmd.orderId,
        commissionerId: cmd.commissionerId,
        workshopId: cmd.workshopId,
      });

      const { allCompleted } = stages.confirmStage({
        stageName: cmd.payload.stageName,
      });

      this.stagesAggregateRepo.save(stages);

      const stageConfirmedEventPayload: StageConfirmedEventV1 = {
        commissionerID: order.commissionerId,
        confirmedAt: isoNow(),
        eventName: 'StageConfirmed',
        orderID: order.orderId,
        schemaV: 1,
        stageName: cmd.payload.stageName,
        workshopID: cmd.workshopId,
      };
      enqueueOutbox({
        id: randomUUID(),
        createdAt: isoNow(),
        payload: {
          ...stageConfirmedEventPayload,
        },
      });

      if (allCompleted) {
        const stageConfirmedEventPayload: AllStagesCompletedEventV1 = {
          commissionerID: order.commissionerId,
          completedAt: isoNow(),
          eventName: 'AllStagesCompleted',
          orderID: order.orderId,
          schemaV: 1,
          workshopID: cmd.workshopId,
        };
        enqueueOutbox({
          id: randomUUID(),
          createdAt: isoNow(),
          payload: {
            ...stageConfirmedEventPayload,
          },
        });
      }
    });
  }
}
