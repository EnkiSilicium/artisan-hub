import { Equals, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BaseEvent } from "libs/contracts/src/_common/base-event.event";

export class OrderCancelledEvent implements BaseEvent<'OrderCancelled'> {

    @IsNotEmpty()
    @IsString()
    eventName!: "OrderCancelled";

    @IsNotEmpty()
    @IsString()
    orderId!: string;

    @IsNotEmpty()
    @IsString()
    cancelledAt!: string;

    @IsNotEmpty()
    @IsString()
    @IsISO8601()
    cancelledBy!: string;

    @IsInt()
    aggregateVersion!: number 

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    reason?: string;

    @Equals(1)
    schemaV!: 1;

}