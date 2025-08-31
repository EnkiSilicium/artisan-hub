import { BonusEventEntity } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.entity';
import { BonusEventName, BonusEventNameEnum } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.registy';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

// factories
export function makeBonusEvent(over: Partial<BonusEventEntity> = {}): BonusEventEntity {
  const event = Object.assign(Object.create(BonusEventEntity.prototype), {
    eventId: over.eventId ?? randomUUID(),
    commissionerId: over.commissionerId ?? randomUUID(),
    injestedAt: over.injestedAt ?? isoNow(),
    eventName:
      over.eventName ??
      (BonusEventNameEnum).OrderCompleted ??
      'OrderCompleted',
    createdAt: over.createdAt ?? isoNow(),
    lastUpdatedAt: over.lastUpdatedAt ?? isoNow(),
    version: over.version ?? 1,
  } as BonusEventEntity);
  return event;
}
