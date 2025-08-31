import {
  OrderStates,
  OrderActions,
} from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.enum';

/**
 * The absolute source of truth for state transitions.
 */
export const OrderTransitions = {
  [OrderStates.PendingWorkshopInvitations]: {
    [OrderActions.TransitionToPendingCompletion]: OrderStates.PendingCompletion,
    [OrderActions.Cancel]: OrderStates.Cancelled,
  },
  [OrderStates.PendingCompletion]: {
    [OrderActions.MarkAsComplete]: OrderStates.MarkedAsCompleted,
    [OrderActions.Cancel]: OrderStates.CancelDisputeOpened,
  },
  [OrderStates.MarkedAsCompleted]: {
    [OrderActions.Complete]: OrderStates.Completed,
    [OrderActions.Cancel]: OrderStates.CancelDisputeOpened,
  },
  [OrderStates.Completed]: {},
  [OrderStates.Cancelled]: {},
  [OrderStates.CancelDisputeOpened]: {},
} as const satisfies Record<
  OrderStates,
  Partial<Record<OrderActions, OrderStates>>
>;
