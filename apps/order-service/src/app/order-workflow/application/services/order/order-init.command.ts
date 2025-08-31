export type OrderInitCommand = {
  payload: {
    commissionerId: string;
    selectedWorkshops: string[];
    request: {
      description: string;
      deadline: string;
      budget: string;
      title: string;
    };
  };
};
