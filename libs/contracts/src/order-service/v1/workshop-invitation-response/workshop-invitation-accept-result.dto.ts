import { ApiProperty } from '@nestjs/swagger';

export class WorkshopInvitationAcceptResultDto {
  @ApiProperty({ type: String, description: 'Order ID' })
  orderId!: string;

  @ApiProperty({ type: String, description: 'Workshop ID' })
  workshopId!: string;
}
