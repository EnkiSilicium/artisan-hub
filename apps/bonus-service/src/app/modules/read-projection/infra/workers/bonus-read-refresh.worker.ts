import { Logger, OnModuleInit } from '@nestjs/common';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { BonusReadHandler } from '../../application/bonus-read/bonus-read.query-handler';
import {
  BONUS_READ_REFRESH_JOB,
  BONUS_READ_REFRESH_QUEUE,
} from './bonus-read-refresh.token';

@Processor(BONUS_READ_REFRESH_QUEUE)
export class BonusReadRefreshWorker extends WorkerHost implements OnModuleInit {
  constructor(
    private readonly service: BonusReadHandler,
    @InjectQueue(BONUS_READ_REFRESH_QUEUE) private readonly queue: Queue,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      BONUS_READ_REFRESH_JOB,
      {},
      {
        repeat: { every: 300_000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async process(job: Job): Promise<void> {
    Logger.verbose({
      message: `Worker: read projection refreshed!`,
    });
    await this.service.refresh();
  }
}
