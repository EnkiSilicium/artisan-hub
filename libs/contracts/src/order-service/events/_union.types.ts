import { BaseEvent } from 'libs/contracts/src/_common/base-event.event';
import * as event from './index';
import { GetInstanceType } from 'shared-kernel';

export type OrderEventNameToCtor = {
  [K in keyof typeof event]: (typeof event)[K] extends new (
    ...args: any[]
  ) => BaseEvent<string>
    ? (typeof event)[K]
    : never;
};

export type OrderEventNameToInstance = GetInstanceType<
  OrderEventNameToCtor[keyof OrderEventNameToCtor]
>;

export type OrderEventNameUnion = OrderEventNameToInstance['eventName'];

export type OrderEventInstanceUnion = GetInstanceType<
  OrderEventNameToCtor[keyof OrderEventNameToCtor]
>;

export type OrderEventCtorUnion =
  OrderEventNameToCtor[keyof OrderEventNameToCtor];
