
import { Controller, UseInterceptors } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

import { KafkaTopics } from 'contracts';
import { BonusEventService } from 'apps/bonus-service/src/app/modules/bonus-processor/application/services/bonus-event/bonus-event.service';
import { randomUUID } from 'crypto';
import { ProgrammerErrorRegistry } from 'error-handling/registries/common';
import { isoNow } from 'shared-kernel';
import { ProgrammerError } from 'error-handling/error-core';
import { KafkaErrorInterceptor } from 'error-handling/interceptor';
import { LoggingInterceptor } from 'observability';

@UseInterceptors(KafkaErrorInterceptor, LoggingInterceptor)
@Controller()
export class BonusEventsConsumer {
  constructor(private readonly bonusService: BonusEventService) {}

  @EventPattern(KafkaTopics.OrderTransitions)
  async onOrderTransitions(
    @Payload() payload: unknown,
    @Ctx() ctx: KafkaContext,
  ) {
    await this.route(payload, ctx);
  }

  @EventPattern(KafkaTopics.StageTransitions)
  async onStageTransitions(
    @Payload() payload: unknown,
    @Ctx() ctx: KafkaContext,
  ) {
    await this.route(payload, ctx);
  }


  // If event is invalid, it's detected at the application/domain layer.
  private async route(event: any, ctx: KafkaContext): Promise<void> {
    const eventId = event?.eventId ?? randomUUID();
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
