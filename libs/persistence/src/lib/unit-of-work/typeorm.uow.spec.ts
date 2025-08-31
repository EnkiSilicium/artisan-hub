import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

// UoW + helpers under test (your real code)
import { TypeOrmUoW, inRollbackedTestTx } from 'persistence';
import {
  getAmbient,
  currentManager,
  requireTxManager,
  enqueueOutbox,
} from 'libs/persistence/src/lib/helpers/transaction.helper';

import { OutboxMessage } from 'libs/persistence/src/lib/outbox/outbox-message.entity';
import { isoNow } from 'shared-kernel';
import { InfraError} from 'error-handling/error-core';
import {InfraErrorRegistry} from 'error-handling/registries/common'

type KafkaProducerPort<T> = { dispatch(messages: T[]): Promise<void> };
const kafkaMock: KafkaProducerPort<OutboxMessage> = {
  dispatch: jest.fn().mockResolvedValue(undefined),
};



jest.setTimeout(60_000);

describe('TypeOrmUoW (integration)', () => {
  let container: StartedPostgreSqlContainer;
  let ds: DataSource;
  let uow: TypeOrmUoW;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpw')
      .start();

    ds = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      entities: [OutboxMessage],
      entitySkipConstructor: true,
      synchronize: true,
    });
    await ds.initialize();

    uow = new TypeOrmUoW(ds, kafkaMock);
  });

  afterAll(async () => {
    if (ds?.isInitialized) await ds.destroy();
    await container.stop();
  });

  beforeEach(() => {
    (kafkaMock.dispatch as jest.Mock).mockClear();
  });

  it('writing outside UoW throws for requireTxManager and enqueueOutbox', async () => {
    expect(() => requireTxManager(ds as any)).toThrow();

    const msg: OutboxMessage = {
      id: randomUUID(),
      payload: { kind: 'test', createdAt: isoNow() },
      createdAt: isoNow(),
    } as any;

    expect(() => enqueueOutbox(msg)).toThrow();
  });

  it('commit path: persists outbox within tx, publishes after commit, then deletes', async () => {
    const id = randomUUID();
    const msg: OutboxMessage = {
      id,
      payload: { kind: 'orderUpdated', createdAt: isoNow(), lastUpdatedAt: isoNow() },
      createdAt: isoNow(),
    } as any;

    let seenInsideTx = 0;

    await uow.run({}, async () => {
      enqueueOutbox(msg);

      // Not persisted yet: beforeCommit will persist
      const em = currentManager(ds);
      const before = await em.find(OutboxMessage);
      expect(before.length).toBe(0);

      // verify in beforeCommit it’s actually in the DB
      const s = getAmbient()!;
      s.beforeCommit!.push(async () => {
        const rows = await currentManager(ds).find(OutboxMessage);
        seenInsideTx = rows.length;
        expect(rows.map(r => r.id)).toContain(id);
      });
    });

    // published exactly once with our message
    expect(kafkaMock.dispatch).toHaveBeenCalledTimes(1);
    const dispatchedBatch = (kafkaMock.dispatch as jest.Mock).mock.calls[0][0] as OutboxMessage[];
    expect(dispatchedBatch.map(m => m.id)).toContain(id);

    // we saw exactly one persisted row before commit
    expect(seenInsideTx).toBe(1);

    // delete is now awaited inside UoW; table is empty immediately
    const rows = await ds.manager.find(OutboxMessage);
    expect(rows.length).toBe(0);
  });

  it('rollback path: no rows remain, nothing published', async () => {
    const id = randomUUID();
    const msg: OutboxMessage = {
      id,
      payload: { kind: 'rollbackMe', createdAt: isoNow() },
      createdAt: isoNow(),
    } as any;

    await inRollbackedTestTx(ds, async () => {
      await uow.run({}, async () => {
        enqueueOutbox(msg);
      });
      // outer wrapper rolls back
    });

    expect(kafkaMock.dispatch).not.toHaveBeenCalled();
    const rows = await ds.manager.find(OutboxMessage);
    expect(rows.length).toBe(0);
  });

  it('nested REQUIRED propagation: inner run reuses outer tx; single commit & publish', async () => {
    const id1 = randomUUID();
    const id2 = randomUUID();

    await uow.run({}, async () => {
      enqueueOutbox({
        id: id1,
        payload: { kind: 'batchA', createdAt: isoNow() },
        createdAt: isoNow(),
      } as any);

      await uow.run({}, async () => {
        enqueueOutbox({
          id: id2,
          payload: { kind: 'batchB', createdAt: isoNow() },
          createdAt: isoNow(),
        } as any);
      });
    });

    expect(kafkaMock.dispatch).toHaveBeenCalledTimes(1);
    const batch = (kafkaMock.dispatch as jest.Mock).mock.calls[0][0] as OutboxMessage[];
    expect(batch.map(b => b.id).sort()).toEqual([id1, id2].sort());

    const rows = await ds.manager.find(OutboxMessage);
    expect(rows.length).toBe(0);
  });

  it('runWithRetry retries exactly once on InfraError:TX_CONFLICT', async () => {
    const id = randomUUID();
    let attempts = 0;

    await uow.runWithRetry({}, async () => {
      attempts++;
      if (attempts === 1) {
        throw new InfraError({
          errorObject: InfraErrorRegistry.byCode.TX_CONFLICT
        });
      }
      enqueueOutbox({
        id,
        payload: { kind: 'afterRetry', createdAt: isoNow() },
        createdAt: isoNow(),
      } as any);
    });

    expect(attempts).toBe(2);
    expect(kafkaMock.dispatch).toHaveBeenCalledTimes(1);
    const sent = (kafkaMock.dispatch as jest.Mock).mock.calls[0][0] as OutboxMessage[];
    expect(sent.map(s => s.id)).toContain(id);

    const rows = await ds.manager.find(OutboxMessage);
    expect(rows.length).toBe(0);
  });
});
