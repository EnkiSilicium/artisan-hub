import { randomUUID } from 'crypto';

import { isoNow } from 'shared-kernel';

import { AdditiveBonus } from './additive-bonus.entity';

export function makeAdditiveBonus(
  over: Partial<AdditiveBonus> = {},
): AdditiveBonus {
  const ab = Object.create(AdditiveBonus.prototype) as AdditiveBonus;
  Object.assign(ab, {
    commissionerId: over.commissionerId ?? randomUUID(),
    totalPoints: over.totalPoints ?? 0,
    grade: over.grade ?? 'Bronze',
    bonusPolicyVersion: over.bonusPolicyVersion ?? 1,
    gradePolicyVersion: over.gradePolicyVersion ?? 1,
    createdAt: over.createdAt ?? isoNow(),
    lastUpdatedAt: over.lastUpdatedAt ?? isoNow(),
    version: over.version ?? 1,
    events: over.events ?? [],
    ...over,
  });
  return ab;
}
