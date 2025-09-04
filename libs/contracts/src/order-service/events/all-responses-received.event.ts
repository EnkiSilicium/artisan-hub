import { IsString, IsNotEmpty, Equals, IsISO8601 } from "class-validator";
import { BaseEvent } from "libs/contracts/src/_common/base-event.event";

export class AllResponsesReceivedEvent implements BaseEvent<'AllResponsesReceived'> {
  @IsString()
  @IsNotEmpty()
  eventName!: 'AllResponsesReceived'

  @IsString()
  @IsNotEmpty()
  orderID!: string;

  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @Equals(1)
  schemaV!: 1;

  @IsISO8601()
  receivedAt!: string;
}