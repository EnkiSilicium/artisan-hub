import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { DataSource, In } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { randomUUID } from 'crypto';

// Repo under test
import { VipProfileRepo } from './vip-profile.repo';

// Entities
import { VipProfile } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/vip-profile.entity';
import { LastMonthEventSet } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/last-month-event-set.entity';
import { AdditiveBonus } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/additive-bonus/additive-bonus.entity';
import { BonusEventEntity } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.entity';

import {
  inRollbackedTestTx,
  requireTxManager,
  TypeOrmUoW,
} from 'persistence';
import {
  makeVipProfile,
  makeLMEvent,
} from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/vip-profile/vip-profile.mock-factory';
import { makeBonusEvent } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/bonus-event/bonus-event.mock-factory';
import { BonusEventName } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.registy';
import { makeAdditiveBonus } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/additive-bonus/additive-bonus.mock-factory';
import { KafkaProducerPort } from 'adapter';
import { isoNow } from 'shared-kernel';

const kafkaMock = { dispatch: jest.fn().mockResolvedValue(undefined) } as KafkaProducerPort<any>;

jest.setTimeout(60_000);

/**
 * Bundle maker: for each LMES, create a matching BonusEventEntity with identical (eventId, commissionerId)
 * and the same eventName. Returns the pairs, and also persists required parents:
 *   - AdditiveBonus(commissionerId)
 *   - BonusEventEntity(eventId, commissionerId)
 * So later repo.update can safely insert LMES without FK violations.
 */
async function seedBonusParentsAndBundles(
  ds: DataSource,
  uow: TypeOrmUoW,
  commissionerId: string,
  lmes: LastMonthEventSet[],
): Promise<
  Array<{ bonusEventEntity: BonusEventEntity; lastMonthEvent: LastMonthEventSet }>
> {
  const bundles = lmes.map((ev) => {
    const be = makeBonusEvent({
      eventId: ev.eventId,
      commissionerId,
      eventName: ev.eventName as BonusEventName,
      injestedAt: isoNow(),
      version: 1,
    });
    return { bonusEventEntity: be, lastMonthEvent: ev };
  });

  await uow.run({}, async () => {
    // Upsert AdditiveBonus parent (idempotent)
    await ds
      .createQueryBuilder()
      .insert()
      .into(AdditiveBonus)
      .values(makeAdditiveBonus({ commissionerId, version: 1 }))
      .orIgnore() // ON CONFLICT DO NOTHING (postgres)
      .execute();

    // Insert BonusEventEntity parents for each LMES
    for (const { bonusEventEntity } of bundles) {
      await ds
        .createQueryBuilder()
        .insert()
        .into(BonusEventEntity)
        .values(bonusEventEntity)
        .orIgnore()
        .execute();
    }
  });

  return bundles;
}

describe('VipProfileRepo (integration) — save semantics with rollback isolation', () => {
  let container: StartedPostgreSqlContainer;
  let ds: DataSource;
  let uow: TypeOrmUoW;
  let repo: VipProfileRepo;

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
      entities: [VipProfile, LastMonthEventSet, AdditiveBonus, BonusEventEntity],
      synchronize: true,
      entitySkipConstructor: true,
    });
    await ds.initialize();

    const moduleRef = await Test.createTestingModule({
      providers: [
        VipProfileRepo,
        { provide: DataSource, useValue: ds },
        {
          provide: TypeOrmUoW,
          useFactory: () => new TypeOrmUoW(ds, kafkaMock),
        },
      ],
    }).compile();

    repo = moduleRef.get(VipProfileRepo);
    uow = moduleRef.get(TypeOrmUoW);
  });

  afterAll(async () => {
    if (ds.isInitialized) await ds.destroy();
    await container.stop();
  });

  it('insert profile; update inserts missing events', async () => {
    await inRollbackedTestTx(ds, async () => {
      const commissionerId = randomUUID();

      // Aggregate proposes LMES rows
      const event1 = makeLMEvent({ commissionerId });
      const event2 = makeLMEvent({ commissionerId, bucket: 1 });
      const vp = makeVipProfile({
        commissionerId,
        lastMonthEvents: [event1, event2],
      });

      // Persist the profile first (parent for LMES via commissioner_id)
      await uow.run({}, async () => {
        await repo.insert(vp);
      });

      // Seed required parents for LMES: AdditiveBonus + matching BonusEventEntity rows
      await seedBonusParentsAndBundles(ds, uow, commissionerId, [
        event1,
        event2,
      ]);

      // Now update should insert LMES without FK explosions
      await uow.run({}, async () => {
        await repo.update(vp);
      });

      const manager = requireTxManager(ds);
      const rows = await manager.find(LastMonthEventSet, {
        where: { commissionerId },
      });

      expect(rows.map((r) => r.eventId).sort()).toEqual(
        [event1.eventId, event2.eventId].sort(),
      );
      expect(rows.every((r) => r.version === 1)).toBe(true);
    });
  });

  it('update removes rows not present in aggregate', async () => {
    await inRollbackedTestTx(ds, async () => {
      const commissionerId = randomUUID();
      const event1 = makeLMEvent({ commissionerId, bucket: 0 });
      const event2 = makeLMEvent({ commissionerId, bucket: 1 });
      const vp = makeVipProfile({
        commissionerId,
        lastMonthEvents: [event1, event2],
      });

      // Insert VIP profile and parents for both events
      await uow.run({}, async () => {
        await repo.insert(vp);
      });
      await seedBonusParentsAndBundles(ds, uow, commissionerId, [
        event1,
        event2,
      ]);

      // First sync inserts both LMES
      await uow.run({}, async () => {
        await repo.update(vp);
      });

      // Now shrink to only event2; update should delete event1
      vp.lastMonthEvents = [event2];

      await uow.run({}, async () => {
        await repo.update(vp);
      });

      const manager = requireTxManager(ds);
      const rows = await manager.find(LastMonthEventSet, {
        where: { commissionerId },
      });
      expect(rows).toHaveLength(1);
      expect(rows[0].eventId).toBe(event2.eventId);
    });
  });

  it('update is idempotent for same set', async () => {
    await inRollbackedTestTx(ds, async () => {
      const commissionerId = randomUUID();
      const event1 = makeLMEvent({ commissionerId, bucket: 2 });
      const event2 = makeLMEvent({ commissionerId, bucket: 3 });
      const vp = makeVipProfile({
        commissionerId,
        lastMonthEvents: [event1, event2],
      });

      await uow.run({}, async () => {
        await repo.insert(vp);
      });
      await seedBonusParentsAndBundles(ds, uow, commissionerId, [
        event1,
        event2,
      ]);

      await uow.run({}, async () => {
        await repo.update(vp);
        await repo.update(vp);
      });

      const manager = requireTxManager(ds);
      const rows = await manager.find(LastMonthEventSet, {
        where: { commissionerId },
      });
      expect(rows.map((r) => r.eventId).sort()).toEqual(
        [event1.eventId, event2.eventId].sort(),
      );
    });
  });

  it('empty events => delete all', async () => {
    await inRollbackedTestTx(ds, async () => {
      const commissionerId = randomUUID();
      const event1 = makeLMEvent({ commissionerId });
      const event2 = makeLMEvent({ commissionerId });
      const vp = makeVipProfile({
        commissionerId,
        lastMonthEvents: [event1, event2],
      });

      await uow.run({}, async () => {
        await repo.insert(vp);
      });
      await seedBonusParentsAndBundles(ds, uow, commissionerId, [
        event1,
        event2,
      ]);

      // First bring DB in sync with two LMES
      await uow.run({}, async () => {
        await repo.update(vp);
      });

      // Then drop them all
      vp.lastMonthEvents = [];

      await uow.run({}, async () => {
        await repo.update(vp);
      });

      const manager = requireTxManager(ds);
      const rows = await manager.find(LastMonthEventSet, {
        where: { commissionerId },
      });
      expect(rows).toHaveLength(0);
    });
  });
});
