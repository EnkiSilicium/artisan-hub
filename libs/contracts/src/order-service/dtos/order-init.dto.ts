import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Payload for creating a new order request.
 */
export class RequestOrderInitPayload {
  @ApiProperty({ type: String, description: 'Human‑readable title of the order' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ type: String, description: 'Detailed description of the order' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Deadline for the order (ISO‑8601 timestamp)',
  })
  @IsISO8601()
  deadline!: string;

  @ApiProperty({ type: String, description: 'Proposed budget for the work' })
  @IsString()
  @IsNotEmpty()
  budget!: string;
}

/**
 * DTO for creating an order (version 1).
 */
export class OrderInitDtoV1 {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the commissioner creating the order',
  })
  @IsString()
  @IsNotEmpty()
  commissionerID!: string;

  @ApiProperty({
    type: String,
    isArray: true,
    description: 'IDs of the selected workshops',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedWorkshops!: string[];

  @ApiProperty({
    type: () => RequestOrderInitPayload,
    description: 'Payload describing the order request',
  })
  @ValidateNested()
  @Type(() => RequestOrderInitPayload)
  request!: RequestOrderInitPayload;
}
