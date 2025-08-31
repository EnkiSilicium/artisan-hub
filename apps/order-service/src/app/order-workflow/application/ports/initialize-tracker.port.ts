export abstract class WorkshopInvitationTrackerPort {
  abstract initializeTracker(orderId: string, total: number): Promise<void>;
  abstract recordDeclinedInvitation(
    orderId: string,
    workshopId: string,
  ): Promise<void>;
}
