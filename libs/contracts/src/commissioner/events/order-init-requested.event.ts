import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderInitRequestPayload {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsISO8601() // read: must be an ISO 8601 timestamp string (event.g., 2025-08-17T12:34:56Z)
  deadline!: string;

  @IsString()
  @IsNotEmpty()
  budget!: string; // if you want strict currency, swap to @IsCurrency()
}

export class OrderInitRequestedEvent {
  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedWorkshops!: string[];

  @ValidateNested()
  request!: OrderInitRequestPayload;

  @Equals(1) // read: schemaV must equal the number 1, exactly
  schemaV!: 1;
}
