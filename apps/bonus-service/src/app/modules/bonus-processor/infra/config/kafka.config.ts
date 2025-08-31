import { KafkaFactoryInputs, makeKafkaConfigBundle } from 'persistence';

export const bonusProcessorKafkaFactoryInputs: KafkaFactoryInputs = {
    groupId: "bonus-processor",
    clientId: "bonus-processor",
};
export const bonusProcessorKafkaConfig = makeKafkaConfigBundle(bonusProcessorKafkaFactoryInputs);
