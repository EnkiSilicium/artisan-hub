import { WorkshopInvitation } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.entity';
import { WorkshopInvitationStatus } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.enum';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

export function makeWorkshopInvitation(
  over: Partial<WorkshopInvitation> = {},
): WorkshopInvitation {
  const w = Object.create(WorkshopInvitation.prototype) as WorkshopInvitation;
  const status = over.status ?? WorkshopInvitationStatus.Pending;
  Object.assign(w, {
    orderId: over.orderId ?? randomUUID(),
    workshopId: over.workshopId ?? randomUUID(),
    status,
    description: status === WorkshopInvitationStatus.Accepted ? 'd' : null,
    deadline: status === WorkshopInvitationStatus.Accepted ? isoNow() : null,
    budget: status === WorkshopInvitationStatus.Accepted ? '100' : null,
    createdAt: isoNow(),
    lastUpdatedAt: isoNow(),
    version: 1,
    ...over,
  });
  return w;
}
