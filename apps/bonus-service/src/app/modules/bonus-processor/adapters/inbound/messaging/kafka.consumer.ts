import { createHash } from 'crypto';

import { Controller, UseInterceptors } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { BonusEventService } from 'apps/bonus-service/src/app/modules/bonus-processor/application/services/bonus-event/bonus-event.service';
import { KafkaTopics } from 'contracts';
import { KafkaErrorInterceptor } from 'error-handling/interceptor';
import { assertCommissionerIdDefined } from '../assertions/assert-commissioner-id-defined.assertion';
import { assertEventNameDefined } from '../assertions/assert-event-name-defined.assertion';
import { LoggingInterceptor } from 'observability';
import { isoNow } from 'shared-kernel';

@Controller()
export class BonusEventsConsumer {
  constructor(private readonly bonusService: BonusEventService) {}

  @UseInterceptors(KafkaErrorInterceptor, LoggingInterceptor)
  @EventPattern(KafkaTopics.OrderTransitions)
  async onOrderTransitions(
    @Payload() payload: object,
    @Ctx() ctx: KafkaContext,
  ) {
    const eventId = getHashId(payload);
    await this.route({ ...payload, eventId }, ctx);
  }

  @EventPattern(KafkaTopics.StageTransitions)
  async onStageTransitions(
    @Payload() payload: object,
    @Ctx() ctx: KafkaContext,
  ) {
    await this.route(payload, ctx);
  }

  // If event is invalid, it's detected at the application/domain layer.
  private async route(event: any, ctx: KafkaContext): Promise<void> {
    const eventId = event?.eventId ?? getHashId(event);
    const eventName = event?.eventName;
    assertEventNameDefined({ eventName });
    const commissionerId = event?.commissionerId;
    assertCommissionerIdDefined({ commissionerId, eventName });
    const injestedAt = isoNow();

    await this.bonusService.process({
      eventId,
      commissionerId,
      injestedAt,
      eventName,
    });
  }
}

export function getHashId(payload: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify({ payload }))
    .digest('base64url')
    .slice(0, 10);
}
