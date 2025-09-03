// order-event-dispatcher.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Producer, Message } from 'kafkajs';
import { KafkaTopics, OrderEventInstanceUnion } from 'contracts';
import { OrderServiceTopicMap } from 'apps/order-service/src/app/order-workflow/adapters/outbound/messaging/kafka.topic-map';
import { KAFKA_PRODUCER } from 'persistence';
import { KafkaProducerPort } from 'adapter';

type PerTopicBuckets = Map<KafkaTopics, Message[]>;

@Injectable()
export class OrderEventDispatcher
  implements KafkaProducerPort<OrderEventInstanceUnion>
{
  private readonly logger = new Logger(OrderEventDispatcher.name);

  constructor(@Inject(KAFKA_PRODUCER) private readonly producer: Producer) {}

  /**
   * Dispatch a mixed bag of events. Each event's eventName selects the topic.
   * Batches by topic for efficiency; preserves per-key order within each topic/partition.
   */
  async dispatch(events: Array<OrderEventInstanceUnion>): Promise<void> {
    if (!events.length) return;

    const buckets: PerTopicBuckets = new Map();

    for (const evt of events) {
      const topic = OrderServiceTopicMap[evt.eventName];
      if (!topic) {
        // Should be impossible if the map is typed as Record<Union['eventName'], …>
        this.logger.error(`No topic mapping for eventName=${evt.eventName}`);
        continue;
      }

      const key = pickKey(evt); // stable per-workflow/aggregate key for partitioning
      if (!key) {
        // You want deterministic partitioning; warn if we’re flying blind
        this.logger.warn(
          `No stable key on event ${evt.eventName}. Consider adding workflowId/orderId.`,
        );
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

    // Send each topic's messages
    Logger.verbose({
      message: `Dispatching ${events.length} events in ${buckets.size} topic(s).`,
      context: OrderEventDispatcher.name,
      meta: { topics: Array.from(buckets.keys()), events: events.map(e => e.eventName) },
    });
    await Promise.all(
      Array.from(buckets.entries()).map(([topic, messages]) =>
        this.producer.send({ topic, messages }),
      ),
    );
    Logger.verbose({
      message: `SUCCESS: Dispatched ${events.length} events in ${buckets.size} topic(s).`,
      context: OrderEventDispatcher.name,
      meta: { topics: Array.from(buckets.keys()), events: events.map(e => e.eventName) }
    });

  }
}

function pickKey(evt: OrderEventInstanceUnion): string | undefined {
  return (
    (evt as any).orderId ??
    (evt as any).commissionerId ??
    (evt as any).workshopId ??
    (evt as any).eventId ??
    undefined
  );
}
