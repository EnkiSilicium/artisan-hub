import { IsString, IsNotEmpty, IsISO8601, Equals } from "class-validator";

export class OrderCompletedV1 {
  @IsString()
  @IsNotEmpty()
  eventName!: 'OrderCompleted'

  @IsString()
  @IsNotEmpty()
  orderID!: string;

  @IsString()
  @IsNotEmpty()
  workshopID!: string;

  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @IsISO8601()
  confirmedAt!: string;

  @Equals(1)
  schemaV!: 1;
}


