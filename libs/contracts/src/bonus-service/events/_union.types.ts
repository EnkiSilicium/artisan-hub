import { BaseEvent } from 'libs/contracts/src/_common/base-event.event';
import * as event from './index';
import { GetInstanceType } from 'shared-kernel';

export type BonusEventNameToCtor = {
  [K in keyof typeof event]: (typeof event)[K] extends new (
    ...args: any[]
  ) => BaseEvent<string>
    ? (typeof event)[K]
    : never;
};
//todo: implement properly
export type BonusEventNameToInstance = GetInstanceType<
  BonusEventNameToCtor[keyof BonusEventNameToCtor]
>;

export type BonusEventNameUnion = BonusEventNameToInstance['eventName'];
export type BonusEventInstanceUnion = GetInstanceType<
  BonusEventNameToCtor[keyof BonusEventNameToCtor]
>;
export type BonusEventCtorUnion =
  BonusEventNameToCtor[keyof BonusEventNameToCtor];
