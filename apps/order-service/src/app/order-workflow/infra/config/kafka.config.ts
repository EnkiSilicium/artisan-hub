import { KafkaFactoryInputs, makeKafkaConfigBundle } from 'persistence';






export const orderKafkaFactoryInputs: KafkaFactoryInputs = {
    groupId: "order-workflow",
    clientId: "order-workflow",
};
export const orderWorkflowKafkaConfig = makeKafkaConfigBundle(orderKafkaFactoryInputs);
