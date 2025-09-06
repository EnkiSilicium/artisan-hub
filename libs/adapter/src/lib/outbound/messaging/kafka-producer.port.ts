export abstract class KafkaProducerPort<message extends { eventName: string }> {
  abstract dispatch(events: Array<message> | undefined): Promise<void>;
}
