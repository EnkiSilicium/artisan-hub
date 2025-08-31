export type RequestEditBudgetCommand = {
  orderId: string;
  payload: { budget: string };
};

export type RequestEditDescriptionCommand = {
  orderId: string;
  payload: { description: string };
};

export type RequestEditDeadlineCommand = {
  orderId: string;
  payload: { deadline: string };
};
