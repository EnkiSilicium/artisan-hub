import {
  IsString,
  IsNotEmpty,
  IsISO8601,
  Equals,
  IsInt,
} from 'class-validator';

export class OrderCompletedV1 {
  @IsString()
  @IsNotEmpty()
  eventName!: 'OrderCompleted';

  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  workshopId!: string;

  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @IsInt()
  aggregateVersion!: number;

  @IsISO8601()
  confirmedAt!: string;

  @Equals(1)
  schemaV!: 1;
}
