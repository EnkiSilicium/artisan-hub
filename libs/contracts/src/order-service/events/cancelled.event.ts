import { Equals, IsISO8601, IsNotEmpty, IsString } from "class-validator";
import { BaseEvent } from "libs/contracts/src/_common/base-event.event";

export class CancelledEventV1 implements BaseEvent<'Cancelled'> {
    @IsString()
    @IsNotEmpty()
    eventName!: 'Cancelled'

    @IsString()
    @IsNotEmpty()
    orderID!: string

    @IsString()
    cancelledBy!: "commissioner" | "workshop"

    @Equals(1)
    schemaV!: 1

    @IsISO8601()
    cancelledAt!: string;
}
