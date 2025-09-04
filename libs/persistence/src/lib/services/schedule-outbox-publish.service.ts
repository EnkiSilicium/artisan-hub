import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventPayload } from 'libs/persistence/src/lib/workers/outbox.worker';
import {
  OUTBOX_JOB_PUBLISH,
  OUTBOX_QUEUE,
} from 'libs/persistence/src/lib/tokens/outbox.tokens';

import { injectTraceIntoData } from 'observability'

@Injectable()
export class OutboxService {
  constructor(@InjectQueue(OUTBOX_QUEUE) private readonly queue: Queue) { }

  async enqueuePublish(cmd: { events: EventPayload[]; outboxIds: string[] }) {
    Logger.verbose({
      message: `Publishing job enqued for events: ${cmd.events.map((e) => e.eventName).join(` ,`)}`,
      meta: { outboxIds: cmd.outboxIds },
    });
    return this.queue.add(OUTBOX_JOB_PUBLISH, injectTraceIntoData({
      events: cmd.events,
      outboxIds: cmd.outboxIds,
    })

    );
  }
}
