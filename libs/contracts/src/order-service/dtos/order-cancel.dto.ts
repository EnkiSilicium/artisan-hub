import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OrderCancelDtoV1 {
    @ApiProperty({
        description: 'Unique identifier of the order',
        type: String,
        format: 'uuid',
    })
    @IsNotEmpty()
    @IsString()
    orderId!: string;

    @ApiProperty({
        description: 'Identifier the actor cancelling the order (unprotected and purely informational)',
        type: String,
        example: 'system'
    })
    @IsNotEmpty()
    @IsString()
    cancelledBy!: string;

    @ApiPropertyOptional({
        description: 'Reason for cancelling the order',
        example: 'Cancelled by customer',
        type: String,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    reason!: string;
}


