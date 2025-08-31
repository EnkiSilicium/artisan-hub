// order-event-dispatcher.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Producer, Message } from 'kafkajs';
import { BonusEventInstanceUnion, KafkaTopics } from 'contracts';
import { OrderServiceTopicMap } from 'apps/order-service/src/app/order-workflow/adapters/outbound/messaging/kafka.topic-map';
import { KAFKA_PRODUCER } from 'persistence';
import { KafkaProducerPort } from 'adapter';
import { BonusServiceTopicMap } from 'apps/bonus-service/src/app/modules/bonus-processor/adapters/outbound/messaging/kafka.topic-map';


type PerTopicBuckets = Map<KafkaTopics, Message[]>;

@Injectable()
export class BonusEventDispatcher implements KafkaProducerPort<BonusEventInstanceUnion> {
  private readonly logger = new Logger(BonusEventDispatcher.name);

  constructor(@Inject(KAFKA_PRODUCER) private readonly producer: Producer) {}

  /**
   * Dispatch a mixed bag of events. Each event's eventName selects the topic.
   * Batches by topic for efficiency; preserves per-key order within each topic/partition.
   */
  async dispatch(events: Array<BonusEventInstanceUnion>): Promise<void> {
    if (!events.length) return;

    const buckets: PerTopicBuckets = new Map();

    for (const evt of events) {
      const topic = BonusServiceTopicMap[evt.eventName];
      if (!topic) {
        // Should be impossible if the map is typed as Record<Union['eventName'], …>
        this.logger.error(`No topic mapping for eventName=${evt.eventName}`);
        continue;
      }

      const key = pickKey(evt); // stable per-workflow/aggregate key for partitioning
      if (!key) {
        // You want deterministic partitioning; warn if we’re flying blind
        this.logger.warn(`No stable key on event ${evt.eventName}. Consider adding workflowId/orderId.`);
      }

      const msg: Message = {
        key: key ?? undefined,
        value: Buffer.from(JSON.stringify(evt)),
        headers: {
          'x-event-name': Buffer.from(evt.eventName),
        },
      };

      const list = buckets.get(topic);
      if (list) list.push(msg);
      else buckets.set(topic, [msg]);
    }

    // Send each topic's messages as a batch.
    await Promise.all(
      Array.from(buckets.entries()).map(([topic, messages]) =>
        this.producer.send({ topic, messages }),
      ),
    );
  }
}


function pickKey(evt: BonusEventInstanceUnion): string | undefined {
  return (
    (evt as any).orderId ??
    (evt as any).commissionerId ??
    (evt as any).workshopId ??
    (evt as any).eventId ??
    undefined
  );
}
