import { KafkaFactoryInputs, makeKafkaConfigBundle } from 'persistence';



const orderKafkaFactoryInputs: KafkaFactoryInputs = {
    groupId: "order-read",
    clientId: "order-read",
};
export const orderReadKafkaConfig = makeKafkaConfigBundle(orderKafkaFactoryInputs);
