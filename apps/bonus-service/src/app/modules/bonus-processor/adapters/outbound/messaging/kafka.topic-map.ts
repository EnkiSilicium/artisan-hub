import { BonusEventInstanceUnion, KafkaTopics } from "contracts";

export const BonusServiceTopicMap: Record<BonusEventInstanceUnion["eventName"], KafkaTopics> ={
    GradeAttained: KafkaTopics.GradeUpdates,
    VipAccquired: KafkaTopics.VipStatusUpdates,
    VipLost: KafkaTopics.VipStatusUpdates

} as const