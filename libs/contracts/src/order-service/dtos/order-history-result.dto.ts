export class OrderHistoryQueryResultFlatDto {
  // order
  orderId!: string;
  orderState!: string;
  commissionerId!: string;
  isTerminated!: boolean;
  orderCreatedAt!: string;
  orderLastUpdatedAt!: string;

  // request
  requestTitle!: string;
  requestDescription!: string;
  requestDeadline!: string;
  requestBudget!: string;
  requestCreatedAt!: string;
  requestLastUpdatedAt!: string;

  // invitation
  workshopId!: string | null;
  invitationStatus!: string | null;
  invitationDescription!: string | null;
  invitationDeadline!: string | null;
  invitationBudget!: string | null;
  invitationCreatedAt!: string | null;
  invitationLastUpdatedAt!: string | null;

  // stage
  stageName!: string | null;
  stageOrder!: number | null;
  stageStatus!: string | null;
  approximateLength!: string | null;
  needsConfirmation!: boolean | null;
  stageCreatedAt!: string | null;
  stageLastUpdatedAt!: string | null;
}

export class OrderHistoryQueryResultDto {
  total!: number;
  items!: OrderHistoryQueryResultFlatDto[];
}
