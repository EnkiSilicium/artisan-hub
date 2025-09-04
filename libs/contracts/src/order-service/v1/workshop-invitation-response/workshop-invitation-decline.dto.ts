import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

/**
 * DTO used to decline a workshop invitation.
 */
export class DeclineWorkshopInvitationDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the workshop declining the invitation',
  })
  @IsString()
  @IsNotEmpty()
  workshopId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the order involved',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

}
