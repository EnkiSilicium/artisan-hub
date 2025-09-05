import { ActorName } from 'apps/order-service/src/app/order-workflow/infra/auth/assertions/actor.enum';

import type { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import type { WorkshopInvitation } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.entity';

// Map ActorName to entity field
export const ActorEntityFieldMap: Record<
  Partial<ActorName>,
  Partial<keyof WorkshopInvitation | keyof Order>
> = {
  [ActorName.Commissioner]: 'commissionerId',
  [ActorName.Workshop]: 'workshopId',
};
