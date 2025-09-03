import { OnModuleInit } from '@nestjs/common';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { OrderStagesReadService } from '../../application/query-handlers/history.query-handler';

@Processor('order-history-refresh')
export class OrderHistoryRefreshJob extends WorkerHost implements OnModuleInit {
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
        repeat: { every: 10_000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async process(job: Job): Promise<void> {
    await this.service.refresh();
  }
}
