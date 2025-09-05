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
import { ProgrammerError } from 'error-handling/error-core';
import { KafkaErrorInterceptor } from 'error-handling/interceptor';
import { ProgrammerErrorRegistry } from 'error-handling/registries/common';
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
    const commissionerId = event?.commissionerId;
    if (!commissionerId) {
      throw new ProgrammerError({
        errorObject: ProgrammerErrorRegistry.byCode.BUG,
        details: {
          description: `injested event named [${event?.eventName}] does not have commissionerId`,
        },
      });
    }
    const injestedAt = isoNow();
    const eventName = event?.eventName;
    if (!eventName) {
      throw new ProgrammerError({
        errorObject: ProgrammerErrorRegistry.byCode.BUG,
        details: { description: `injested event does not have eventName` },
      });
    }

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
