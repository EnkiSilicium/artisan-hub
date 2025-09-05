import type { OrderHistoryProjection } from 'apps/order-service/src/app/read-model/infra/persistence/projections/order-histrory.projection';
import type {
  OrderHistoryQueryResultDto,
  OrderHistoryQueryResultFlatDto,
} from 'contracts';

export const toOrderHistoryFlatDto = (
  row: OrderHistoryProjection,
): OrderHistoryQueryResultFlatDto => ({
  // order
  orderId: row.orderId,
  orderState: row.orderState,
  commissionerId: row.commissionerId,
  isTerminated: row.isTerminated,
  orderCreatedAt: row.orderCreatedAt,
  orderLastUpdatedAt: row.orderLastUpdatedAt,

  // request
  requestTitle: row.requestTitle,
  requestDescription: row.requestDescription,
  requestDeadline: row.requestDeadline,
  requestBudget: row.requestBudget,
  requestCreatedAt: row.requestCreatedAt,
  requestLastUpdatedAt: row.requestLastUpdatedAt,

  // invitation
  workshopId: row.workshopId,
  invitationStatus: row.invitationStatus,
  invitationDescription: row.invitationDescription,
  invitationDeadline: row.invitationDeadline,
  invitationBudget: row.invitationBudget,
  invitationCreatedAt: row.invitationCreatedAt,
  invitationLastUpdatedAt: row.invitationLastUpdatedAt,

  // stage
  stageName: row.stageName,
  stageOrder: row.stageOrder,
  stageStatus: row.stageStatus,
  approximateLength: row.approximateLength,
  needsConfirmation: row.needsConfirmation,
  stageCreatedAt: row.stageCreatedAt,
  stageLastUpdatedAt: row.stageLastUpdatedAt,
});

export const toOrderStageFlatPageDto = (
  total: number,
  rows: OrderHistoryProjection[],
): OrderHistoryQueryResultDto => ({
  total,
  items: rows.map(toOrderHistoryFlatDto),
});
