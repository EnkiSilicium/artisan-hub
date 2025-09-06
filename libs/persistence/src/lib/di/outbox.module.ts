// src/outbox/outbox.module.ts
import { Module } from '@nestjs/common';

export const OUTBOX_QUEUE = 'outbox-publisher';

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class OutboxModule {}
