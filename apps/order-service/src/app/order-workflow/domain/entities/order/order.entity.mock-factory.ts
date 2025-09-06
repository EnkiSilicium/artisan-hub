import { randomUUID } from 'crypto';

import { isoNow } from 'shared-kernel';

import { Order } from './order.entity';
import { PendingWorkshopInvitations } from './order.state';

export function makeOrder(over: Partial<Order> = {}): Order {
  const o = Object.create(Order.prototype) as Order;
  Object.assign(o, {
    orderId: randomUUID(),
    commissionerId: randomUUID(),
    state: new PendingWorkshopInvitations(),
    isTerminated: false,
    createdAt: isoNow(),
    lastUpdatedAt: isoNow(),
    version: 1,
    ...over,
  });
  return o;
}
