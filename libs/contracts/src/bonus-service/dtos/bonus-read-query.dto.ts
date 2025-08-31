// read-model/dto/vip-additive.query.dto.ts
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const SORT_FIELDS = ['vipCreatedAt', 'vipLastUpdatedAt', 'bonusLastUpdatedAt', 'totalPoints'] as const;
const SORT_DIRS = ['asc', 'desc'] as const;

export class BonusReadQueryDto {
  @IsOptional() @IsUUID()
  commissionerId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : undefined)
  @IsBoolean()
  isVIP?: boolean;

  @IsOptional() @IsString()
  grade?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(0)
  minTotalPoints?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(0)
  maxTotalPoints?: number;

  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  vipPolicyVersion?: number;

  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  bonusPolicyVersion?: number;

  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  gradePolicyVersion?: number;

  @IsOptional() @IsISO8601()
  createdFrom?: string;

  @IsOptional() @IsISO8601()
  createdTo?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1) @Max(500)
  limit?: number = 50;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(0)
  offset?: number = 0;

  @IsOptional() @IsIn(SORT_FIELDS as readonly string[])
  sort?: (typeof SORT_FIELDS)[number] = 'vipLastUpdatedAt';

  @IsOptional() @IsIn(SORT_DIRS as readonly string[])
  sortDir?: (typeof SORT_DIRS)[number] = 'desc';
}
