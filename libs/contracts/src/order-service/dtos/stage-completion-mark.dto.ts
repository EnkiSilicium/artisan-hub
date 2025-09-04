import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO used to mark a stage as completed.
 */
export class MarkStageCompletionDtoV1 {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the workshop concerned',
  })
  @IsString()
  @IsNotEmpty()
  workshopId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the commissioner',
  })
  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the order for which the stage is being marked',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({
    type: String,
    description: 'Name of the stage to mark as completed',
    example: 'Delivery',
  })
  @IsString()
  @IsNotEmpty()
  stageName!: string;
}
