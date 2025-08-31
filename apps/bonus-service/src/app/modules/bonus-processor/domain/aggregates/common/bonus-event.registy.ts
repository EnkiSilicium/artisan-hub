import { OrderEventNameUnion } from 'contracts';

export const BonusEventNameEnum = {
  OrderCompleted: 'OrderCompleted',
  OrderPlaced: 'OrderPlaced',
} as const satisfies Partial<Record<OrderEventNameUnion, string>>;

export type BonusEventName = keyof typeof BonusEventNameEnum;

export class EventBonusInfo {
  bonusAmount: number;
}

export type BonusEventRegistry =
  Record<BonusEventName, EventBonusInfo>

export class BonusEventRegistryInterface {
  readonly policyName: 'BonusEventRegistry';
  version: number;

  registry: BonusEventRegistry;
}



export const BonusEventRegistry: BonusEventRegistryInterface = {
  policyName: 'BonusEventRegistry',
  version: 1,
  registry: {
    OrderCompleted: { bonusAmount: 100 },
    OrderPlaced: { bonusAmount: 40 },
  },
};


