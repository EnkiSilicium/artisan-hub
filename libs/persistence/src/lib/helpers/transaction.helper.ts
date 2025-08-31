import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';
import { Ambient } from 'libs/persistence/src/lib/interfaces/transaction-context.type';
import { OutboxMessage } from 'libs/persistence/src/lib/outbox/outbox-message.entity';
import { ProgrammerError} from 'error-handling/error-core';
import {ProgrammerErrorRegistry} from 'error-handling/registries/common'


export const als = new AsyncLocalStorage<Ambient>();
/**
 * Syntactic sugar to get the als of the current transaction.
 *
 * @returns als ambient storage or undefined if outside of active UoW transaction.
 */
export function getAmbient(): Ambient | undefined {
  return als.getStore() ?? undefined;
}

/**
 *
 * @param ds typeorm DataSource
 * @returns EntityManager of the current transaction, fallbacks to default manager if outside of it.
 */
export function currentManager(ds: { manager: EntityManager }): EntityManager {
  // ok for reads; writes should use requireTxManager
  return getAmbient()?.manager ?? ds.manager;
}

/**
 *
 *
 * @param ds typeorm DataSource
 * @returns EntityManager of the current transaction.
 * @throws if outside of UoW transaction.
 */
export function requireTxManager(ds: {
  manager: EntityManager;
}): EntityManager {
  const manager = getAmbient()?.manager;
  if (!manager) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description: `using '${requireTxManager.name}' outside of transaction`,
      },
    });
  }

  return manager;
}

/**
 * Queues functions to be executed BEFORE transaction commit as a part of
 * the typeorm UoW.
 *
 * @param cb callback
 */
export function registerBeforeCommit(cb: () => Promise<void> | void) {
  const s = getAmbient();
  if (!s?.beforeCommit) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description: `using '${registerBeforeCommit.name}' outside of transaction`,
      },
    });
  }
  s.beforeCommit.push(cb);
}

/**
 * Queues functions to be executed AFTER transaction commit as a part of
 * the typeorm UoW.
 *
 * @param cb callback
 */
export function registerAfterCommit(cb: () => Promise<void> | void) {
  const s = getAmbient();
  if (!s?.afterCommit) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description: `using '${registerAfterCommit.name}' outside of transaction`,
      },
    });
  }
  s.afterCommit.push(cb);
}

/**
 * Puts domain events into outbox.
 *
 * Those are committed as a part of the transaction and flushed into kafka after commit.
 * Runs BEFORE beforeCommit
 *
 * @param msg what to put in outbox
 */
export function enqueueOutbox(msg: OutboxMessage) {
  const s = getAmbient();
  if (!s?.outboxBuffer) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description: `using '${enqueueOutbox.name}' outside of transaction`,
      },
    });
  }
  //assertImplementsEntityTechnicals(msg.payload);

  if (msg?.payload?.createdAt instanceof Date) {
    msg.payload.createdAt = msg.payload.createdAt.toISOString();
  }

  if (msg?.payload?.lastUpdatedAt instanceof Date) {
    msg.payload.lastUpdatedAt = msg.payload.lastUpdatedAt.toISOString();
  }

  s.outboxBuffer.push(msg);
}
