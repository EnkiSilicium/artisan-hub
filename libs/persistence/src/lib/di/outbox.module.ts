// src/outbox/outbox.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OutboxProcessor } from 'libs/persistence/src/lib/workers/outbox.worker';
import { outboxBullMqConfigFactory } from 'libs/persistence/src/lib/config/outbox-bullmq-config.factory';
import { OutboxService } from 'libs/persistence/src/lib/services/schedule-outbox-publish.service';


export const OUTBOX_QUEUE = 'outbox-publisher';

@Module({
  imports: [

  ],
  providers: [],
  exports: []
})
export class OutboxModule {}