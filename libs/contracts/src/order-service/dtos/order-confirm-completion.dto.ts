import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OrderConfirmCompletionDtoV1 {
  @ApiProperty({
    description: 'Unique identifier of the order',
    type: String,
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  orderId!: string;

  @ApiProperty({
    description: 'Unique identifier of the workshop',
    type: String,
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  workshopId!: string;

  @ApiProperty({
    description: 'Unique identifier of the commissioner',
    type: String,
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  commissionerId!: string;
}
