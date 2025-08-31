// read-model/dto/vip-additive.dto.ts
export class BonusReadFlatDto {
  commissionerId!: string;

  // vip profile
  isVIP!: boolean;
  vipLastTickAt!: string;
  vipLastBucket!: number;
  vipPolicyVersion!: number;
  windowAlgoPolicyVersion!: number;
  vipBonusPolicyVersion!: number;
  vipCreatedAt!: string;
  vipLastUpdatedAt!: string;

  // additive bonus
  totalPoints!: number;
  grade!: string;
  bonusPolicyVersion!: number;
  gradePolicyVersion!: number;
  bonusCreatedAt!: string;
  bonusLastUpdatedAt!: string;
}

export class BonusReadresultDto {
  total!: number;
  items!: BonusReadFlatDto[];
}