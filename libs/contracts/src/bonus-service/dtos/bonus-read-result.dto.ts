import { ApiProperty } from '@nestjs/swagger';

/**
 * Flattened bonus record.
 * Brittle, AI-generated read model; prefer consumer-driven contracts in production.
 */
export class BonusReadFlatDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Commissioner ID',
  })
  commissionerId!: string;

  // VIP profile
  @ApiProperty({
    type: Boolean,
    description: 'Whether the commissioner is currently VIP',
    example: true,
  })
  isVIP!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time of last VIP tick',
    example: '2024-01-10T10:00:00.000Z',
  })
  vipLastTickAt!: string;

  @ApiProperty({
    type: Number,
    description: 'Latest VIP bucket index',
    example: 3,
  })
  vipLastBucket!: number;

  @ApiProperty({
    type: Number,
    description: 'VIP policy version in effect',
    example: 2,
  })
  vipPolicyVersion!: number;

  @ApiProperty({
    type: Number,
    description: 'Window algorithm policy version',
    example: 1,
  })
  windowAlgoPolicyVersion!: number;

  @ApiProperty({
    type: Number,
    description: 'Bonus policy version used for VIP',
    example: 5,
  })
  vipBonusPolicyVersion!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time the VIP status was created',
    example: '2023-12-01T00:00:00.000Z',
  })
  vipCreatedAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time the VIP status was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  vipLastUpdatedAt!: string;

  // Additive bonus
  @ApiProperty({
    type: Number,
    description: 'Total additive points',
    example: 1200,
  })
  totalPoints!: number;

  @ApiProperty({
    type: String,
    description: 'Grade achieved',
    example: 'gold',
  })
  grade!: string;

  @ApiProperty({
    type: Number,
    description: 'Bonus policy version for additive bonus',
    example: 5,
  })
  bonusPolicyVersion!: number;

  @ApiProperty({
    type: Number,
    description: 'Grade policy version in effect',
    example: 3,
  })
  gradePolicyVersion!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Timestamp when bonus was created',
    example: '2023-12-01T00:00:00.000Z',
  })
  bonusCreatedAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Timestamp when bonus was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  bonusLastUpdatedAt!: string;
}

/**
 * Wrapper for paginated bonus results.
 * Brittle, AI-generated read model; prefer consumer-driven contracts in production.
 */
export class BonusReadresultDto {
  @ApiProperty({
    type: Number,
    description: 'Total count across all pages',
    example: 1,
  })
  total!: number;

  @ApiProperty({
    type: () => BonusReadFlatDto,
    isArray: true,
    description: 'Returned items for this page',
    example: [
      {
        commissionerId: 'd3d94468-2f00-4b36-8c4f-7f6cbb1e4d3c',
        isVIP: true,
        vipLastTickAt: '2024-01-10T10:00:00.000Z',
        vipLastBucket: 3,
        vipPolicyVersion: 2,
        windowAlgoPolicyVersion: 1,
        vipBonusPolicyVersion: 5,
        vipCreatedAt: '2023-12-01T00:00:00.000Z',
        vipLastUpdatedAt: '2024-01-01T00:00:00.000Z',
        totalPoints: 1200,
        grade: 'gold',
        bonusPolicyVersion: 5,
        gradePolicyVersion: 3,
        bonusCreatedAt: '2023-12-01T00:00:00.000Z',
        bonusLastUpdatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  })
  items!: BonusReadFlatDto[];
}
