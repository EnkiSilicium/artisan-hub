import { IsString, IsNotEmpty, Equals, IsISO8601 } from "class-validator";
import { BaseEvent } from "libs/contracts/src/_common/base-event.event";

export class RequestEditedEventV1 implements BaseEvent<'RequestEdited'> {

  @IsString()
  @IsNotEmpty()
  eventName!: 'RequestEdited'

  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @IsString()
  @IsNotEmpty()
  orderID!: string;

  @IsString()
  @IsNotEmpty()
  workshopID!: string;

  @Equals(1)
  schemaV!: 1;
}