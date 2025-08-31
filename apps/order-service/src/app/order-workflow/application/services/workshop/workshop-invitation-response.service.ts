import { Injectable } from '@nestjs/common';
import {
  AcceptWorkshopInvitationCommand,
  DeclineWorkshopInvitationCommand,
} from 'apps/order-service/src/app/order-workflow/application/services/workshop/workshop-invitation-response.command';
import { assertIsFound } from 'apps/order-service/src/app/order-workflow/domain/entities/common/assert-is-found.assertion';
import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import { stagesTemplateFactory } from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage-defaults.factory';
import {
  constructStageData,
  StagesAggregate,
} from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity';
import { WorkshopInvitation } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.entity';
import { OrderRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/order/order.repo';
import { StagesAggregateRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/stage/stage.repo';
import { WorkshopInvitationRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/workshop-invitation/workshop-invitation.repo';
import { TypeOrmUoW, enqueueOutbox } from 'persistence';

import {
  InvitationAcceptedEventV1,
  InvitationDeclinedEventV1,
} from 'contracts';
import { randomUUID } from 'crypto';
import { isoNow } from 'shared-kernel';

@Injectable()
export class WorkshopInvitationResponseService {
  constructor(
    public readonly uow: TypeOrmUoW,
    private readonly ordersRepo: OrderRepo,
    private readonly workshopInvitationsRepo: WorkshopInvitationRepo,
    private readonly stagesAggregateRepo: StagesAggregateRepo,
  ) {}
  async acceptWorkshopInvitation(cmd: AcceptWorkshopInvitationCommand) {
    return this.uow.runWithRetry({}, async () => {
      const order = await this.ordersRepo.findById(cmd.orderId);
      assertIsFound(order, Order, {
        orderId: cmd.orderId,
        workshopId: cmd.workshopId,
      });

      const workshopInvitation = await this.workshopInvitationsRepo.findById(
        cmd.orderId,
        cmd.workshopId,
      );
      assertIsFound(workshopInvitation, WorkshopInvitation, {
        orderId: cmd.orderId,
        workshopId: cmd.workshopId,
      });

      const stageDefault: constructStageData =
        stagesTemplateFactory.produceDefault(cmd.orderId, cmd.workshopId);
      const stages = cmd.payload.stages
        ? new StagesAggregate(cmd.payload.stages)
        : new StagesAggregate([stageDefault]);

      workshopInvitation.accept(cmd.payload);
      order.transitionToPendingCompletion();

      await this.stagesAggregateRepo.save(stages);
      await this.workshopInvitationsRepo.update(workshopInvitation);
      await this.ordersRepo.update(order);

      const eventPayload: InvitationAcceptedEventV1 = {
        commissionerID: order.commissionerId,
        eventName: 'InvitationAccepted',
        acceptedAt: isoNow(),
        orderID: order.orderId,
        schemaV: 1,
        workshopID: cmd.workshopId,
      };
      enqueueOutbox({
        id: randomUUID(),
        createdAt: isoNow(),
        payload: { ...eventPayload },
      });
    });
  }

  //TODO: bundle N workshopInvitations
  async declineWorkshopInvitation(cmd: DeclineWorkshopInvitationCommand) {
    return this.uow.runWithRetry({}, async () => {
      const order = await this.ordersRepo.findById(cmd.orderId);
      assertIsFound(order, Order, {
        orderId: cmd.orderId,
        workshopId: cmd.workshopId,
      });

      const workshopInvitation = await this.workshopInvitationsRepo.findById(
        cmd.orderId,
        cmd.workshopId,
      );
      assertIsFound(workshopInvitation, WorkshopInvitation, {
        orderId: cmd.orderId,
        workshopId: cmd.workshopId,
      });

      workshopInvitation.decline();
      order.cancelOrder();

      await this.workshopInvitationsRepo.update(workshopInvitation);
      await this.ordersRepo.update(order);

      const eventPayload: InvitationDeclinedEventV1 = {
        commissionerID: order.commissionerId,
        eventName: 'InvitationDeclined',
        declinedAt: isoNow(),
        orderID: order.orderId,
        schemaV: 1,
        workshopID: cmd.workshopId,
      };

      enqueueOutbox({
        id: randomUUID(),
        createdAt: isoNow(),
        payload: { ...eventPayload },
      });
    });
  }
}
