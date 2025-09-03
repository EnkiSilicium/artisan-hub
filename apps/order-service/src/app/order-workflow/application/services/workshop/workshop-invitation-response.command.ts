import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity.js';
import { constructStageData } from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity';

export type AcceptWorkshopInvitationCommand = {
  orderId: string;
  workshopId: string;
  order?: Order
  payload: {
    description: string;
    deadline: string;
    budget: string;
    stages?: constructStageData[];
  };
};

export type DeclineWorkshopInvitationCommand = {
  orderId: string;
  workshopId: string;
  order?: Order;

};
