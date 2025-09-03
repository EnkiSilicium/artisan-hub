import { ApiProperty } from '@nestjs/swagger';

export class OrderInitResultDto {
  @ApiProperty({ type: String, description: 'Generated order ID' })
  orderId!: string;
}
