import { KafkaTopics, OrderEventInstanceUnion } from "contracts";

export const OrderServiceTopicMap: Record<OrderEventInstanceUnion["eventName"], KafkaTopics> ={
    AllResponsesReceived: KafkaTopics.AllResponsesReceived,
    AllStagesCompleted: KafkaTopics.StageTransitions,
    Cancelled: KafkaTopics.OrderTransitions,
    InvitationAccepted: KafkaTopics.OrderTransitions,
    InvitationDeclined: KafkaTopics.InvitationDeclined,
    OrderCompleted: KafkaTopics.OrderTransitions,
    OrderPlaced: KafkaTopics.OrderTransitions,
    RequestEdited: KafkaTopics.RequestEdited,
    StageConfirmationMarked: KafkaTopics.StageTransitions,
    StageConfirmed: KafkaTopics.StageTransitions
} as const