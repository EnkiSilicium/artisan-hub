export abstract class WorkshopInvitationTrackerPort {
  abstract initializeTracker(
    orderId: string,
    commissionerId: string,
    total: number,
  ): Promise<void>;
}
