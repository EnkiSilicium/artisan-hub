import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO used when a commissioner confirms that a stage has been completed.
 */
export class ConfirmStageCompletionDtoV1 {
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
    description: 'ID of the order for which the stage was completed',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ type: String, description: 'Name of the stage to confirm' })
  @IsString()
  @IsNotEmpty()
  stageName!: string;
}
