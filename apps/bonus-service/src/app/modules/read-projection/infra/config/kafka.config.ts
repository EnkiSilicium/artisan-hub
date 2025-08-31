import { KafkaFactoryInputs, makeKafkaConfigBundle } from 'persistence';

export const bonusReadKafkaFactoryInputs: KafkaFactoryInputs = {
    groupId: "bonus-read",
    clientId: "bonus-read",
};
export const bonusReadKafkaConfig = makeKafkaConfigBundle(bonusReadKafkaFactoryInputs);
