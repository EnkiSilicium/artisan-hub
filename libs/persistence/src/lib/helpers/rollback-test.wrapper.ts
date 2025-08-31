import { als } from 'libs/persistence/src/lib/helpers/transaction.helper';
import { DataSource } from 'typeorm';

/**
 * Wrapper used for repo testing - once the wrapped code is done, it rollbacks the
 * transaction effectively resetting the DB.
 * @param ds dataSource
 * @param fn 
 * @returns 
 */
export async function inRollbackedTestTx<T>(
  ds: DataSource,
  fn: () => Promise<T>,
): Promise<T> {
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction('READ COMMITTED');

  const store = {
    manager: qr.manager,
    beforeCommit: [] as Array<() => Promise<void> | void>,
    afterCommit: [] as Array<() => Promise<void> | void>,
    outboxBuffer: [] as any[],
  };

  try {
    return await als.run(store, fn);
  } finally {
    await qr.rollbackTransaction();
    await qr.release();
  }
}
