import { BonusEventEntity } from './bonus-event.entity';
import { BonusEventNameEnum, BonusEventName } from './bonus-event.registy';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

export function makeBonusEvent(over: Partial<BonusEventEntity> = {}): BonusEventEntity {
  const event = Object.create(BonusEventEntity.prototype) as BonusEventEntity;
  Object.assign(event, {
    eventId: over.eventId ?? randomUUID(),
    commissionerId: over.commissionerId ?? randomUUID(),
    injestedAt: over.injestedAt ?? isoNow(),
    eventName: over.eventName ?? (BonusEventNameEnum as Record<string, BonusEventName>).OrderCompleted ?? 'OrderCompleted',
    createdAt: over.createdAt ?? isoNow(),
    lastUpdatedAt: over.lastUpdatedAt ?? isoNow(),
    version: over.version ?? 1,
    ...over,
  });
  return event;
}
