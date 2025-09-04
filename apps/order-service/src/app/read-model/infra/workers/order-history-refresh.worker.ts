import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

import { OrderStagesReadService } from '../../application/query-handlers/history.query-handler';

@Processor('order-history-refresh')
export class OrderHistoryRefreshWorker
  extends WorkerHost
  implements OnModuleInit
{
  constructor(
    private readonly service: OrderStagesReadService,
    @InjectQueue('order-history-refresh') private readonly queue: Queue,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      'refresh',
      {},
      {
        repeat: { every: 300_000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async process(): Promise<void> {
    Logger.verbose({
      message: `Worker: read-projection refreshed!`,
    });
    await this.service.refresh();
  }
}
