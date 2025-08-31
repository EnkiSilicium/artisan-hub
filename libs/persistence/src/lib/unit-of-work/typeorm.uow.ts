import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';


import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { Ambient, Propagation } from 'libs/persistence/src/lib/interfaces/transaction-context.type';
import { getAmbient, als } from 'libs/persistence/src/lib/helpers/transaction.helper';
import { OutboxMessage } from 'libs/persistence/src/lib/outbox/outbox-message.entity';
import {KafkaProducerPort} from 'adapter'

import { InfraError} from 'error-handling/error-core';




@Injectable()
export class TypeOrmUoW {
  constructor(
    private readonly ds: DataSource,
    private readonly kafka: KafkaProducerPort<OutboxMessage>,
  ) {}

  async run<T>(
    context: Partial<
      Pick<Ambient, 'actorId' | 'correlationId' | 'nowIso'>
    > = {},
    fn: () => Promise<T>,
    opts?: { isolation?: IsolationLevel; propagation?: Propagation },
  ): Promise<T> {
    const parent: Ambient | undefined = getAmbient();
    const propagation: Propagation = opts?.propagation ?? 'REQUIRED';

    // If we already have a tx in ALS and propagation is REQUIRED, reuse it.
    if (parent?.manager && propagation === 'REQUIRED') {
      // Shallow-merge context into existing store; reuse arrays so hooks/outbox accumulate on the outer tx.
      const merged: Ambient = {
        ...parent,
        ...context,
        manager: parent.manager,
        beforeCommit: parent.beforeCommit ?? [],
        afterCommit: parent.afterCommit ?? [],
        outboxBuffer: parent.outboxBuffer ?? [],
      };
      return await als.run(merged, fn);
    }

    // Otherwise, open a new transaction (outermost or REQUIRES_NEW)
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction(opts?.isolation ?? 'READ COMMITTED');

    const store: Ambient = {
      ...(parent ?? {}),
      ...context,
      manager: qr.manager,
      beforeCommit: [],
      afterCommit: [],
      outboxBuffer: [],
    };

    try {
      const result = await als.run(store, async () => {
        return await fn();
      });
      
      //  beforeCommit hooks
      for (const cb of store.beforeCommit!) await cb();


      // persist staged outbox messages inside the tx
      if (store.outboxBuffer!.length) {
        const rows: OutboxMessage[] = store.outboxBuffer!.map((message) => ({
          id: message.id,
          payload: message.payload,
          createdAt: message.createdAt,
        }));

        await qr.manager.insert(
          OutboxMessage,
          rows as any,
        ); // typeORM types broken
      }






      await qr.commitTransaction();

      //  afterCommit hooks (publish staged messages)
      if (store.outboxBuffer!.length) {
        await this.kafka.dispatch(store.outboxBuffer!);

        const messageIds = store.outboxBuffer!.map((e) => e.id)
        // delete the events after they have been sent.
        // if crashes before that, the startup sequence will try to publish-delete 
        // all unpublished
        await this.ds.manager.delete(OutboxMessage, {id: In(messageIds)})


      }
      for (const cb of store.afterCommit!) await cb();

      return result;
    } catch (event) {
      await qr.rollbackTransaction();
      throw event;
    } finally {
      await qr.release();
    }
  }

  /**
   * Run and retry once on retriable InfraError by reopening a fresh transaction.
   * If the second attempt fails, let the caller/Kafka retry.
   */
  async runWithRetry<T>(
    context: Partial<
      Pick<Ambient, 'actorId' | 'correlationId' | 'nowIso'>
    > = {},
    fn: () => Promise<T>,
    opts?: { isolation?: IsolationLevel },
  ): Promise<T> {
    try {
      return await this.run(context, fn, opts);
    } catch (event) {
      if ((event instanceof InfraError && (event as InfraError).retryable === true)) {
        return await this.run(context, fn, opts);
      }
      throw event;
    }
  }
}
