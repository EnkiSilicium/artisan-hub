import { Injectable } from '@nestjs/common';
import { WorkshopInvitationTrackerPort } from '../../../application/ports/initialize-tracker.port';
import { WorkshopInvitationTracker } from '../../../infra/workshop-invitation-tracker/workshop-invitation-tracker.service';

@Injectable()
export class WorkshopInvitationTrackerAdapter implements WorkshopInvitationTrackerPort {
  constructor(private readonly tracker: WorkshopInvitationTracker) {}

  async initializeTracker(
    orderId: string,
    commissionerId: string,
    total: number,
  ): Promise<void> {
    await this.tracker.initialize(orderId, commissionerId, total);
  }
}

