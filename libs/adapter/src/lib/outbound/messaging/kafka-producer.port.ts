export abstract class KafkaProducerPort<MSG extends { eventName: string } > {
  abstract dispatch(events: Array<MSG> | undefined): Promise<void>;
}