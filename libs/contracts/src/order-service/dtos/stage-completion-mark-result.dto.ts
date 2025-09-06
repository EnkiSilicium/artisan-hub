import { ApiProperty } from '@nestjs/swagger';

export class StageCompletionMarkResultDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Order ID',
  })
  orderId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Workshop ID',
  })
  workshopId!: string;

  @ApiProperty({ type: String, description: 'Stage name', example: 'Delivery' })
  stageName!: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the stage was completed',
    example: true,
  })
  stageCompleted!: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Whether all stages are completed',
    example: false,
  })
  allStagesCompleted!: boolean;
}
