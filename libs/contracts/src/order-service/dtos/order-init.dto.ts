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
export class RequestOrderInitPayloadV1 {
  @ApiProperty({
    type: String,
    description: 'Human‑readable title of the order',
    example: 'Custom table',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    type: String,
    description: 'Detailed description of the order',
    example: 'Build a custom wooden table',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Deadline for the order (ISO‑8601 timestamp)',
    example: '2024-06-01T00:00:00.000Z',
  })
  @IsISO8601()
  deadline!: string;

  @ApiProperty({
    type: String,
    description: 'Proposed budget for the work',
    example: '2000',
  })
  @IsString()
  @IsNotEmpty()
  budget!: string;
}

/**
 * DTO for creating an order (version 1).
 */
export class OrderInitDtoV1 {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the commissioner creating the order',
  })
  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @ApiProperty({
    type: () => RequestOrderInitPayloadV1,
    description: 'Payload describing the order request',
    example: {
      title: 'Custom table',
      description: 'Build a custom wooden table',
      deadline: '2024-06-01T00:00:00.000Z',
      budget: '2000',
    },
  })
  @ValidateNested()
  @Type(() => RequestOrderInitPayloadV1)
  request!: RequestOrderInitPayloadV1;

  @ApiProperty({
    type: String,
    format: 'uuid',
    isArray: true,
    description: 'IDs of the selected workshops',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedWorkshops!: string[];
}
