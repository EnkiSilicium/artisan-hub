export type BonusReadQuery = {
  commissionerId?: string;
  isVIP?: boolean;
  grade?: string;

  minTotalPoints?: number;
  maxTotalPoints?: number;

  vipPolicyVersion?: number;
  bonusPolicyVersion?: number;
  gradePolicyVersion?: number;

  createdFrom?: string;
  createdTo?: string;

  limit?: number;
  offset?: number;
  sort?:
    | 'vipCreatedAt'
    | 'vipLastUpdatedAt'
    | 'bonusLastUpdatedAt'
    | 'totalPoints';
  sortDir?: 'asc' | 'desc';
};
