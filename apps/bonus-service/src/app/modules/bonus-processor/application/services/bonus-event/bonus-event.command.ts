import type { BonusEventName } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.registy';

export type BonusEventProcessCommand = {
  eventId: string;
  commissionerId: string;
  injestedAt: string;
  eventName: BonusEventName;
};
