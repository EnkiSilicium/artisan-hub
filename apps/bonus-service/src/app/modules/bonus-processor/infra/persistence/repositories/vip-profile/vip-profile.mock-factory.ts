import { BonusEventName, BonusEventNameEnum } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.registy';
import { LastMonthEventSet } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/last-month-event-set.entity';
import { VipProfile } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/vip-profile.entity';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

// factories
export function makeVipProfile(over: Partial<VipProfile> = {}): VipProfile {
  const commissionerId = over.commissionerId ?? randomUUID();
  const event = Object.assign(Object.create(VipProfile.prototype), {
    commissionerId,
    lastPeriodPoints: over.lastPeriodPoints ?? 0,
    isVIP: over.isVIP ?? false,
    lastTickAt: over.lastTickAt ?? isoNow(),
    lastBucket: over.lastBucket ?? 0,
    vipPolicyVersion: over.vipPolicyVersion ?? 1,
    windowAlgoPolicyVersion: over.windowAlgoPolicyVersion ?? 1,
    bonusPolicyVersion: over.bonusPolicyVersion ?? 1,
    createdAt: over.createdAt ?? isoNow(),
    lastUpdatedAt: over.lastUpdatedAt ?? isoNow(),
    version: over.version ?? 1,
    lastMonthEvents: over.lastMonthEvents ?? [],
  } as VipProfile);
  return event;
}
export function makeLMEvent(
  over: Partial<LastMonthEventSet> & { commissionerId?: string } = {},
): LastMonthEventSet {
  const event = Object.assign(Object.create(LastMonthEventSet.prototype), {
    eventId: over.eventId ?? randomUUID(),
    commissionerId: over.commissionerId ?? randomUUID(),
    eventName:
      over.eventName ??
      (BonusEventNameEnum).OrderCompleted ??
      'OrderCompleted',
    bucket: over.bucket ?? 0,
    createdAt: over.createdAt ?? isoNow(),
    lastUpdatedAt: over.lastUpdatedAt ?? isoNow(),
    version: over.version ?? 1,
  } as LastMonthEventSet);
  return event;
}
