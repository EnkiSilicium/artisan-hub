import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsISO8601,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';

const SORT_FIELDS = [
  'orderCreatedAt',
  'orderLastUpdatedAt',
  'stageOrder',
] as const;
const SORT_DIRS = ['asc', 'desc'] as const;

/**
 * Query DTO for reading order stages.  Optional fields will be omitted if not provided.
 */
export class ReadOrderStagesQueryDto {
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Filter by commissioner ID',
  })
  @IsOptional()
  @IsUUID()
  commissionerId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by overall order state',
  })
  @IsOptional()
  @IsString()
  orderState?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by invitation status',
  })
  @IsOptional()
  @IsString()
  invitationStatus?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by stage status',
  })
  @IsOptional()
  @IsString()
  stageStatus?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Filter by workshop ID',
  })
  @IsOptional()
  @IsUUID()
  workshopId?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Restrict orders created after this timestamp',
  })
  @IsOptional()
  @IsISO8601()
  orderCreatedFrom?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Restrict orders created before this timestamp',
  })
  @IsOptional()
  @IsISO8601()
  orderCreatedTo?: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 500,
    description: 'Number of rows to return (default 50)',
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
    description: 'Field on which to sort',
    default: 'orderCreatedAt',
  })
  @IsOptional()
  @IsIn(SORT_FIELDS as readonly string[])
  sort?: (typeof SORT_FIELDS)[number] = 'orderCreatedAt';

  @ApiPropertyOptional({
    enum: SORT_DIRS,
    description: 'Direction of the sort',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(SORT_DIRS as readonly string[])
  sortDir?: (typeof SORT_DIRS)[number] = 'desc';
}
