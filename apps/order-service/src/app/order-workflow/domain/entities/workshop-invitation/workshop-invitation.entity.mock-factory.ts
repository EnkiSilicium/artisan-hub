import { WorkshopInvitation } from './workshop-invitation.entity';
import { WorkshopInvitationStatus } from './workshop-invitation.enum';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

export function makeWorkshopInvitation(over: Partial<WorkshopInvitation> = {}): WorkshopInvitation {
  const status = over.status ?? WorkshopInvitationStatus.Pending;
  const w = Object.create(WorkshopInvitation.prototype) as WorkshopInvitation;
  Object.assign(w, {
    orderId: randomUUID(),
    workshopId: randomUUID(),
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
