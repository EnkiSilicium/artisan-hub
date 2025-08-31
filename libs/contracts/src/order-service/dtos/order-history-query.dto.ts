import { Transform } from 'class-transformer';
import { IsOptional, IsUUID, IsString, IsISO8601, IsInt, Min, Max, IsIn } from 'class-validator';

const SORT_FIELDS = ['orderCreatedAt', 'orderLastUpdatedAt', 'stageOrder'] as const;
const SORT_DIRS = ['asc', 'desc'] as const;

export class ReadOrderStagesQueryDto {
  @IsOptional() @IsUUID()
  commissionerId?: string;

  @IsOptional() @IsString()
  orderState?: string;

  @IsOptional() @IsString()
  invitationStatus?: string;

  @IsOptional() @IsString()
  stageStatus?: string;

  @IsOptional() @IsUUID()
  workshopId?: string;

  @IsOptional() @IsISO8601()
  orderCreatedFrom?: string;

  @IsOptional() @IsISO8601()
  orderCreatedTo?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1) @Max(500)
  limit?: number = 50;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(0)
  offset?: number = 0;

  @IsOptional() @IsIn(SORT_FIELDS as readonly string[])
  sort?: (typeof SORT_FIELDS)[number] = 'orderCreatedAt';

  @IsOptional() @IsIn(SORT_DIRS as readonly string[])
  sortDir?: (typeof SORT_DIRS)[number] = 'desc';
}
