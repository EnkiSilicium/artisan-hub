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
  orderID!: string;

  @IsString()
  @IsNotEmpty()
  workshopID!: string;

  @IsString()
  @IsNotEmpty()
  commissionerID!: string;

  @IsInt()
  aggregateVersion!: number;

  @IsISO8601()
  confirmedAt!: string;

  @Equals(1)
  schemaV!: 1;
}
