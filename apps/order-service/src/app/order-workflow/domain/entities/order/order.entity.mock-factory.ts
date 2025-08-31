import { Order } from './order.entity';
import { PendingWorkshopInvitations } from './order.state';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

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
