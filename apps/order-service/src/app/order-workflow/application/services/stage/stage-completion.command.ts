import type { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';

export type AcceptCompletionMarkedCommand = {
  orderId: string;
  workshopId: string;
  order?: Order;
  payload: { stageName: string };
};

export type ConfirmStageCompletionCommand = {
  orderId: string;
  workshopId: string;
  order?: Order;
  payload: { stageName: string };
};
