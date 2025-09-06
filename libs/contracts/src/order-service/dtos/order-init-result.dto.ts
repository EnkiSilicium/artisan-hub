import { ApiProperty } from '@nestjs/swagger';

export class OrderInitResultDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Generated order ID',
  })
  orderId!: string;
}
