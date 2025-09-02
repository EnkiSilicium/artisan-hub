import { OnModuleInit } from '@nestjs/common';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { BonusReadHandler } from '../../application/bonus-read/bonus-read.query-handler';

@Processor('bonus-read-refresh')
export class BonusReadRefreshJob extends WorkerHost implements OnModuleInit {
  constructor(
    private readonly service: BonusReadHandler,
    @InjectQueue('bonus-read-refresh') private readonly queue: Queue,
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
