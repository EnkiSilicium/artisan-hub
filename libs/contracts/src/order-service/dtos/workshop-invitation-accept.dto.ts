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
 * Acceptance payload data for a workshop invitation.
 */
export class AcceptWorkshopInvitationPayload {
  @ApiProperty({ type: String, description: 'Additional description supplied by the workshop' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Proposed deadline for the work (ISO‑8601 timestamp)',
  })
  @IsISO8601()
  deadline!: string;

  @ApiProperty({ type: String, description: 'Proposed budget for the work' })
  @IsString()
  @IsNotEmpty()
  budget!: string;
}

/**
 * DTO used to accept a workshop invitation.
 */
export class AcceptWorkshopInvitationDtoV1 {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the workshop accepting the invitation',
  })
  @IsString()
  @IsNotEmpty()
  workshopId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the order',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

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
    type: () => AcceptWorkshopInvitationPayload,
    description: 'Structured description of the proposal (deadline/budget)',
  })
  @ValidateNested()
  @Type(() => AcceptWorkshopInvitationPayload)
  request!: AcceptWorkshopInvitationPayload;
}
