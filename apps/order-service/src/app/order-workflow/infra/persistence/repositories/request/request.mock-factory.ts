import { randomUUID } from 'crypto';

import { RequestEntity } from 'apps/order-service/src/app/order-workflow/domain/entities/request/request.entity';
import { isoNow } from 'shared-kernel';

export function makeRequest(over: Partial<RequestEntity> = {}): RequestEntity {
  const r = Object.create(RequestEntity.prototype) as RequestEntity;
  Object.assign(r, {
    orderId: over.orderId ?? randomUUID(),
    title: 'title',
    description: 'desc',
    deadline: isoNow(),
    budget: '100',
    createdAt: isoNow(),
    lastUpdatedAt: isoNow(),
    version: 1,
    ...over,
  });
  return r;
}
