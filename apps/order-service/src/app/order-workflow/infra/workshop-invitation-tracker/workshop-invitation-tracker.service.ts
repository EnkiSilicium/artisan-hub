import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InvitationResponseTracker } from '../persistence/entities/invitation-response-tracker.entity';
import {
  AllInvitationsDeclinedEventV1,
  AllResponsesReceivedEventV1,
  OrderEventInstanceUnion,
} from 'contracts';
import { KafkaProducerPort } from 'adapter';
import { isoNow } from 'shared-kernel';

@Injectable()
export class WorkshopInvitationTracker {
  private readonly repo: Repository<InvitationResponseTracker>;
  private readonly logger = new Logger(WorkshopInvitationTracker.name);

  constructor(
    private readonly ds: DataSource,
    private readonly producer: KafkaProducerPort<OrderEventInstanceUnion>,
  ) {
    this.repo = this.ds.getRepository(InvitationResponseTracker);
  }

  async initialize(
    orderId: string,
    commissionerId: string,
    total: number,
  ): Promise<void> {
    const entity = new InvitationResponseTracker();
    entity.orderId = orderId;
    entity.commissionerId = commissionerId;
    entity.total = total;
    entity.responses = 0;
    entity.declines = 0;
    await this.repo.save(entity);
  }

  async handleResponse(orderId: string, declined: boolean) {
    const tracker = await this.repo.findOneBy({ orderId });
    if (!tracker) {
      this.logger.warn(
        `Received invitation response for unknown order ${orderId}`,
      );
      return;
    }

    tracker.responses += 1;
    if (declined) tracker.declines += 1;
    await this.repo.save(tracker);

    if (tracker.responses >= tracker.total) {
      const events: OrderEventInstanceUnion[] = [];

      const allRes: AllResponsesReceivedEventV1 = {
        eventName: 'AllResponsesReceived',
        orderID: orderId,
        commissionerID: tracker.commissionerId,
        schemaV: 1,
        receivedAt: isoNow(),
      };
      events.push(allRes);

      if (tracker.declines >= tracker.total) {
        const allDecl: AllInvitationsDeclinedEventV1 = {
          eventName: 'AllInvitationsDeclined',
          orderID: orderId,
          commissionerID: tracker.commissionerId,
          schemaV: 1,
          declinedAt: isoNow(),
        };
        events.push(allDecl);
      }

      await this.producer.dispatch(events);
      await this.repo.delete({ orderId });
    }
  }
}

