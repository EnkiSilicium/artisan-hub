export enum OrderStates {
  PendingWorkshopInvitations = 'PendingWorkshopInvitations',
  PendingCompletion = 'PendingCompletion',
  MarkedAsCompleted = 'MarkedAsCompleted',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  CancelDisputeOpened = 'CancelDisputeOpened',
}
export enum OrderActions {
  TransitionToPendingCompletion,
  Cancel,
  MarkAsComplete,
  Complete,
}
