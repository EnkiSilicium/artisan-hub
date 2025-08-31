import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

const SORT_FIELDS = ['vipCreatedAt', 'vipLastUpdatedAt', 'bonusLastUpdatedAt', 'totalPoints'] as const;
const SORT_DIRS   = ['asc', 'desc'] as const;

/**
 * Query DTO for reading VIP/additive bonus information.  All fields are optional.
 */
export class BonusReadQueryDto {
  @ApiPropertyOptional({ type: String, format: 'uuid', description: 'Filter by commissioner ID' })
  @IsOptional()
  @IsUUID()
  commissionerId?: string;

  @ApiPropertyOptional({ type: Boolean, description: 'Filter by VIP status' })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : undefined,
  )
  @IsBoolean()
  isVIP?: boolean;

  @ApiPropertyOptional({ type: String, description: 'Filter by grade' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    description: 'Minimum total points',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  minTotalPoints?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    description: 'Maximum total points',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  maxTotalPoints?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'VIP policy version number',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  vipPolicyVersion?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Bonus policy version number',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  bonusPolicyVersion?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Grade policy version number',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  gradePolicyVersion?: number;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Show items created on or after this date',
  })
  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Show items created before this date',
  })
  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 500,
    description: 'Number of items per page (default 50)',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    description: 'Offset into the result set (default 0)',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    enum: SORT_FIELDS,
    description: 'Field on which to sort (default vipLastUpdatedAt)',
    default: 'vipLastUpdatedAt',
  })
  @IsOptional()
  @IsIn(SORT_FIELDS as readonly string[])
  sort?: (typeof SORT_FIELDS)[number] = 'vipLastUpdatedAt';

  @ApiPropertyOptional({
    enum: SORT_DIRS,
    description: 'Direction of the sort (default desc)',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(SORT_DIRS as readonly string[])
  sortDir?: (typeof SORT_DIRS)[number] = 'desc';
}
