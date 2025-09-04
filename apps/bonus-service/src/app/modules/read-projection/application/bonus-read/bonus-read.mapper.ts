// read-model/mappers/vip-additive.mapper.ts

import type { BonusReadProjection } from 'apps/bonus-service/src/app/modules/read-projection/infra/persistence/projections/bonus-read.projection';
import type { BonusReadFlatDto, BonusReadresultDto } from 'contracts';

export const toBonusReadFlatDto = (
  row: BonusReadProjection,
): BonusReadFlatDto => ({
  commissionerId: row.commissionerId,

  isVIP: row.isVIP,
  vipLastTickAt: row.vipLastTickAt,
  vipLastBucket: row.vipLastBucket,
  vipPolicyVersion: row.vipPolicyVersion,
  windowAlgoPolicyVersion: row.windowAlgoPolicyVersion,
  vipBonusPolicyVersion: row.vipBonusPolicyVersion,
  vipCreatedAt: row.vipCreatedAt,
  vipLastUpdatedAt: row.vipLastUpdatedAt,

  totalPoints: row.totalPoints,
  grade: row.grade,
  bonusPolicyVersion: row.bonusPolicyVersion,
  gradePolicyVersion: row.gradePolicyVersion,
  bonusCreatedAt: row.bonusCreatedAt,
  bonusLastUpdatedAt: row.bonusLastUpdatedAt,
});

export const toBonusReadresultDto = (
  total: number,
  rows: BonusReadProjection[],
): BonusReadresultDto => ({
  total,
  items: rows.map(toBonusReadFlatDto),
});
