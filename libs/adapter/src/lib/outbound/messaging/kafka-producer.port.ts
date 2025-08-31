export abstract class KafkaProducerPort<MSG> {
  abstract dispatch(events: Array<MSG> | undefined): Promise<void>;
}
