export type AcceptCompletionMarkedCommand = {
  orderId: string;
  workshopId: string;
  commissionerId: string;
  payload: { stageName: string };
};

export type ConfirmStageCompletionCommand = {
  orderId: string;
  commissionerId: string;
  workshopId: string;
  payload: { stageName: string };
};
