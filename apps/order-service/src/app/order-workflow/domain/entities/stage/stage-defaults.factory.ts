import { constructStageData } from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity';

/**
 * Is responsible for producing non-user-defined stage data.
 * May be extended to contain complex creation/fallback logic in the future.
 */
export const stagesTemplateFactory = {
  produceDefault: (
    orderId: string,
    workshopId: string,
    needsConfirmation: boolean = false,
  ): constructStageData => {
    return {
      orderId: orderId,
      workshopId: workshopId,
      stageName: 'Order',
      approximateLength: 'unspecified',
      needsConfirmation: needsConfirmation,
      description: 'Your order',
      stageOrder: 0,
    };
    
  },
};
