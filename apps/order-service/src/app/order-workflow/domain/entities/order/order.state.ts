import {
  OrderStates,
  OrderActions,
} from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.enum';
import { BaseState } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.type';

import type { Handlers } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.type';

export class PendingWorkshopInvitations extends BaseState<OrderStates.PendingWorkshopInvitations> {
  readonly stateName = OrderStates.PendingWorkshopInvitations as const;

  handlers = {
    [OrderActions.TransitionToPendingCompletion]: {
      nextState: PendingCompletion,
      type: 'legal',
    },
    [OrderActions.Cancel]: { nextState: Cancelled, type: 'legal' },
  } satisfies Handlers<OrderStates.PendingWorkshopInvitations>;
}

export class PendingCompletion extends BaseState<OrderStates.PendingCompletion> {
  readonly stateName = OrderStates.PendingCompletion as const;

  handlers = {
    [OrderActions.MarkAsComplete]: {
      nextState: MarkedAsCompleted,
      type: 'legal',
    },
    [OrderActions.Cancel]: { nextState: CancelDisputeOpened, type: 'legal' },
  } satisfies Handlers<OrderStates.PendingCompletion>;
}

export class MarkedAsCompleted extends BaseState<OrderStates.MarkedAsCompleted> {
  readonly stateName = OrderStates.MarkedAsCompleted as const;

  handlers = {
    [OrderActions.Complete]: { nextState: Completed, type: 'legal' },
    [OrderActions.Cancel]: { nextState: CancelDisputeOpened, type: 'legal' },
  } satisfies Handlers<OrderStates.MarkedAsCompleted>;
}

export class Completed extends BaseState<OrderStates.Completed> {
  readonly stateName = OrderStates.Completed as const;

  handlers = {} satisfies Handlers<OrderStates.Completed>;
}

export class Cancelled extends BaseState<OrderStates.Cancelled> {
  readonly stateName = OrderStates.Cancelled as const;

  handlers = {} satisfies Handlers<OrderStates.Cancelled>;
}

export class CancelDisputeOpened extends BaseState<OrderStates.CancelDisputeOpened> {
  readonly stateName = OrderStates.CancelDisputeOpened as const;

  handlers = {} satisfies Handlers<OrderStates.CancelDisputeOpened>;
}

export const StateRegistry = {
  [OrderStates.PendingWorkshopInvitations]: PendingWorkshopInvitations,
  [OrderStates.PendingCompletion]: PendingCompletion,
  [OrderStates.MarkedAsCompleted]: MarkedAsCompleted,
  [OrderStates.Completed]: Completed,
  [OrderStates.Cancelled]: Cancelled,
  [OrderStates.CancelDisputeOpened]: CancelDisputeOpened,
} as const;
