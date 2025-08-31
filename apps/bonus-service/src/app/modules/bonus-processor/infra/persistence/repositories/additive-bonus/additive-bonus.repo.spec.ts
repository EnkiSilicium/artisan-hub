import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { randomUUID } from 'crypto';

// Repos under test
import { AdditiveBonusRepo } from './additive-bonus.repo';

// Entities (direct)
import { AdditiveBonus } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/additive-bonus/additive-bonus.entity';
import { BonusEventEntity } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.entity';
import { VipProfile } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/vip-profile.entity';
import { LastMonthEventSet } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/last-month-event-set.entity';

import {
  TypeOrmUoW,
  inRollbackedTestTx,
  requireTxManager,
} from 'persistence';
import { makeAdditiveBonus } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/additive-bonus/additive-bonus.mock-factory';

class KafkaMock {
  published: any[] = [];
  async publishBatch(x: any) {
    this.published.push(x);
  }
}

jest.setTimeout(60_000);

describe('AdditiveBonusRepo (integration)', () => {
  let container: StartedPostgreSqlContainer;
  let ds: DataSource;
  let uow: TypeOrmUoW;
  let repo: AdditiveBonusRepo;

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
      entities: [AdditiveBonus, BonusEventEntity, VipProfile, LastMonthEventSet],
      synchronize: true,
      entitySkipConstructor: true,
    });
    await ds.initialize();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdditiveBonusRepo,
        { provide: DataSource, useValue: ds },
        {
          provide: TypeOrmUoW,
          useFactory: () => new TypeOrmUoW(ds, new KafkaMock() as any),
        },
      ],
    }).compile();

    repo = moduleRef.get(AdditiveBonusRepo);
    uow = moduleRef.get(TypeOrmUoW);
  });

  afterAll(async () => {
    if (ds.isInitialized) await ds.destroy();
    await container.stop();
  });

  it('insert persists with v=1 and findByCommissionerId works', async () => {
    await inRollbackedTestTx(ds, async () => {
      const ab = makeAdditiveBonus({ version: 1 });

      await uow.run({}, async () => {
        await repo.insert(ab);
      });

      const found = await repo.findByCommissionerId(ab.commissionerId);
      expect(found).not.toBeNull();
      expect(found!.commissionerId).toBe(ab.commissionerId);
      expect(found!.version).toBe(1);
    });
  });

  it('update bumps version; stale version rejects (optimistic concurrency enforced)', async () => {
    await inRollbackedTestTx(ds, async () => {
      const ab = makeAdditiveBonus({ totalPoints: 5, version: 1 });

      await uow.run({}, async () => {
        await repo.insert(ab);
      });

      const manager = requireTxManager(ds);
      // concurrent bump to v=2
      await manager
        .createQueryBuilder()
        .update(AdditiveBonus)
        .set({
          totalPoints: () => `"total_points" + 1`,
          version: () => `"version" + 1`,
        })
        .where(`"commissioner_id" = :id AND "version" = :v`, {
          id: ab.commissionerId,
          v: 1,
        })
        .execute();

      // try updating with stale v=1
      ab.totalPoints = 10;
      await expect(
        uow.run({}, async () => {
          await repo.update(ab);
        }),
      ).rejects.toThrow();

      // fresh read should be v=2 (unchanged by our failed attempt)
      const row = await repo.findByCommissionerId(ab.commissionerId);
      expect(row!.version).toBe(2);
    });
  });
});
