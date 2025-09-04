import { ApiProperty } from '@nestjs/swagger';

export class StageCompletionConfirmResultDto {
  @ApiProperty({ type: String, description: 'Order ID' })
  orderId!: string;

  @ApiProperty({ type: String, description: 'Workshop ID' })
  workshopId!: string;

  @ApiProperty({ type: String, description: 'Stage name' })
  stageName!: string;

  @ApiProperty({ type: Boolean, description: 'Whether all stages are completed' })
  allStagesCompleted!: boolean;
}
