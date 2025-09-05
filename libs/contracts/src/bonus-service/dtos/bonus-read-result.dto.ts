import { ApiProperty } from '@nestjs/swagger';

/**
 * Flattened bonus record.
 */
export class BonusReadFlatDto {
  @ApiProperty({ type: String, description: 'Commissioner ID' })
  commissionerId!: string;

  // VIP profile
  @ApiProperty({
    type: Boolean,
    description: 'Whether the commissioner is currently VIP',
  })
  isVIP!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time of last VIP tick',
  })
  vipLastTickAt!: string;

  @ApiProperty({ type: Number, description: 'Latest VIP bucket index' })
  vipLastBucket!: number;

  @ApiProperty({ type: Number, description: 'VIP policy version in effect' })
  vipPolicyVersion!: number;

  @ApiProperty({ type: Number, description: 'Window algorithm policy version' })
  windowAlgoPolicyVersion!: number;

  @ApiProperty({
    type: Number,
    description: 'Bonus policy version used for VIP',
  })
  vipBonusPolicyVersion!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time the VIP status was created',
  })
  vipCreatedAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time the VIP status was last updated',
  })
  vipLastUpdatedAt!: string;

  // Additive bonus
  @ApiProperty({ type: Number, description: 'Total additive points' })
  totalPoints!: number;

  @ApiProperty({ type: String, description: 'Grade achieved' })
  grade!: string;

  @ApiProperty({
    type: Number,
    description: 'Bonus policy version for additive bonus',
  })
  bonusPolicyVersion!: number;

  @ApiProperty({ type: Number, description: 'Grade policy version in effect' })
  gradePolicyVersion!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Timestamp when bonus was created',
  })
  bonusCreatedAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Timestamp when bonus was last updated',
  })
  bonusLastUpdatedAt!: string;
}

/**
 * Wrapper for paginated bonus results.
 */
export class BonusReadresultDto {
  @ApiProperty({ type: Number, description: 'Total count across all pages' })
  total!: number;

  @ApiProperty({
    type: () => BonusReadFlatDto,
    isArray: true,
    description: 'Returned items for this page',
  })
  items!: BonusReadFlatDto[];
}
