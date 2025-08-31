import { TestingModule, Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import { RequestEntity } from 'apps/order-service/src/app/order-workflow/domain/entities/request/request.entity';
import {
  Stage,
  StagesAggregate,
} from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity';
import { WorkshopInvitation } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.entity';
import { makeOrder } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/order/order.mock-factory';
import { OrderRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/order/order.repo';
import { makeRequest } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/request/request.mock-factory';
import { RequestRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/request/request.repo';
import { WorkshopInvitationRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/workshop-invitation/workshop-invitation.repo';
import { StagesAggregateRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/stage/stage.repo';

import {
  TypeOrmUoW,
  requireTxManager,
  inRollbackedTestTx,
} from 'persistence';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { makeWorkshopInvitation } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/workshop-invitation/workshop-invitation.mock-factory';
import { makeStage } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/stage/stage.mock-factory';
import { KafkaProducerPort } from 'adapter';
import { InfraError } from 'error-handling/error-core';

describe('StagesAggregateRepo (integration)', () => {
  let moduleRef: TestingModule;
  let ds: DataSource;
  let orderRepo: OrderRepo;
  let requestRepo: RequestRepo;
  let invitationRepo: WorkshopInvitationRepo;
  let repo: StagesAggregateRepo;
  let uow: TypeOrmUoW;
  let container: StartedPostgreSqlContainer;

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
      entities: [Order, RequestEntity, WorkshopInvitation, Stage],
      synchronize: true,
    });
    await ds.initialize();

    const kafkaMock = { dispatch: jest.fn().mockResolvedValue(undefined) } as KafkaProducerPort<any>;

    moduleRef = await Test.createTestingModule({
      providers: [
        OrderRepo,
        RequestRepo,
        WorkshopInvitationRepo,
        StagesAggregateRepo,
        { provide: DataSource, useValue: ds },
        { provide: 'KAFKA_PUBLISHER', useValue: kafkaMock },
        {
          provide: TypeOrmUoW,
          useFactory: (dataSource: DataSource, kafka: any) =>
            new (require('libs/persistence/src/lib/unit-of-work/typeorm.uow').TypeOrmUoW)(
              dataSource,
              kafka,
            ),
          inject: [DataSource, 'KAFKA_PUBLISHER'],
        },
      ],
    }).compile();

    orderRepo = moduleRef.get(OrderRepo);
    requestRepo = moduleRef.get(RequestRepo);
    invitationRepo = moduleRef.get(WorkshopInvitationRepo);
    repo = moduleRef.get(StagesAggregateRepo);
    uow = moduleRef.get(TypeOrmUoW);
  });

  afterAll(async () => {
    await ds.destroy();
    await container.stop();
  });

  it('findByWorkshopInvitation: returns null when no stages exist', async () => {
    await inRollbackedTestTx(ds, async () => {
      const order = makeOrder({ version: 1 });
      const req = makeRequest({ orderId: order.orderId, version: 1 });
      const inv = makeWorkshopInvitation({
        orderId: order.orderId,
        workshopId: randomUUID(),
        version: 1,
      });

      await uow.run({}, async () => {
        await orderRepo.insert(order);
        await requestRepo.insert(req);
        await invitationRepo.insert(inv);
      });

      const agg = await repo.findByWorkshopInvitation({
        orderId: order.orderId,
        workshopId: inv.workshopId,
      });
      expect(agg).toBeNull();
    });
  });

  it('save: inserts new stages with version=1 and retrieval returns aggregate', async () => {
    await inRollbackedTestTx(ds, async () => {
      const order = makeOrder({ version: 1 });
      const req = makeRequest({ orderId: order.orderId, version: 1 });
      const inv = makeWorkshopInvitation({
        orderId: order.orderId,
        workshopId: randomUUID(),
        version: 1,
      });

      const s1 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'A',
        stageOrder: 0,
        version: 1,
      });
      const s2 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'B',
        stageOrder: 1,
        version: 1,
      });
      const agg = new StagesAggregate([s1, s2]);

      await uow.run({}, async () => {
        await orderRepo.insert(order);
        await requestRepo.insert(req);
        await invitationRepo.insert(inv);
      });

      await uow.run({}, async () => {
        await repo.save(agg);
      });

      expect(s1.version).toBe(1);
      expect(s2.version).toBe(1);

      const found = await repo.findByWorkshopInvitation({
        orderId: order.orderId,
        workshopId: inv.workshopId,
      });
      expect(found).not.toBeNull();
      expect(found!.stages.length).toBe(2);
      expect(found!.stages[0].stageName).toBe('A');
      expect(found!.stages[1].stageName).toBe('B');
    });
  });

  it('save: updates existing stage and bumps version; replace=true deletes removed', async () => {
    await inRollbackedTestTx(ds, async () => {
      const order = makeOrder({ version: 1 });
      const req = makeRequest({ orderId: order.orderId, version: 1 });
      const inv = makeWorkshopInvitation({
        orderId: order.orderId,
        workshopId: randomUUID(),
        version: 1,
      });

      const s1 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'A',
        stageOrder: 0,
        description: 'a',
        version: 1,
      });
      const s2 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'B',
        stageOrder: 1,
        description: 'b',
        version: 1,
      });
      const agg = new StagesAggregate([s1, s2]);

      await uow.run({}, async () => {
        await orderRepo.insert(order);
        await requestRepo.insert(req);
        await invitationRepo.insert(inv);
        await repo.save(agg);
      });

      s1.description = 'a2';
      agg.stages = [s1];
      agg.amountOfStages = 1;

      await uow.run({}, async () => {
        await repo.save(agg, true);
      });

      expect(s1.version).toBe(2);

      const found = await repo.findByWorkshopInvitation({
        orderId: order.orderId,
        workshopId: inv.workshopId,
      });
      expect(found!.stages.length).toBe(1);
      expect(found!.stages[0].stageName).toBe('A');
      expect(found!.stages[0].description).toBe('a2');
      expect(found!.stages[0].version).toBe(2);
    });
  });

  it('save: replace=false keeps missing DB stages intact', async () => {
    await inRollbackedTestTx(ds, async () => {
      const order = makeOrder({ version: 1 });
      const req = makeRequest({ orderId: order.orderId, version: 1 });
      const inv = makeWorkshopInvitation({
        orderId: order.orderId,
        workshopId: randomUUID(),
        version: 1,
      });

      const s1 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'A',
        stageOrder: 0,
        version: 1,
      });
      const s2 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'B',
        stageOrder: 1,
        version: 1,
      });
      const agg = new StagesAggregate([s1, s2]);

      await uow.run({}, async () => {
        await orderRepo.insert(order);
        await requestRepo.insert(req);
        await invitationRepo.insert(inv);
        await repo.save(agg);
      });

      agg.stages = [s2];

      await uow.run({}, async () => {
        await repo.save(agg, false);
      });

      const found = await repo.findByWorkshopInvitation({
        orderId: order.orderId,
        workshopId: inv.workshopId,
      });
      expect(found!.stages.length).toBe(2);
      const names = found!.stages.map((s) => s.stageName);
      expect(names).toEqual(expect.arrayContaining(['A', 'B']));
    });
  });

  it('save: optimistic lock on stage update throws', async () => {
    await inRollbackedTestTx(ds, async () => {
      const order = makeOrder({ version: 1 });
      const req = makeRequest({ orderId: order.orderId, version: 1 });
      const inv = makeWorkshopInvitation({
        orderId: order.orderId,
        workshopId: randomUUID(),
        version: 1,
      });

      const s = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'C',
        stageOrder: 0,
        description: 'c',
        version: 1,
      });
      const agg = new StagesAggregate([s]);

      await uow.run({}, async () => {
        await orderRepo.insert(order);
        await requestRepo.insert(req);
        await invitationRepo.insert(inv);
        await repo.save(agg);
      });

      const manager = requireTxManager(ds); // for writes; throws if no tx

      await manager
        .createQueryBuilder()
        .update(Stage)
        .set({
          description: 'external',
          // atomic bump using a DB-side expression
          version: () => '"version" + 1',
        })
        .where({
          orderId: order.orderId,
          workshopId: inv.workshopId,
          stageName: 'C',
          version: 1,
        })
        .execute();

      s.description = 'mine';
      //agg.stages[0].version = 1
      await expect(
        uow.run({}, async () => {
          await repo.save(agg, true);
        }),
      ).rejects.toThrow(InfraError);

      const found = await repo.findByWorkshopInvitation({
        orderId: order.orderId,
        workshopId: inv.workshopId,
      });
      expect(found!.stages[0].description).toBe('external');
      expect(found!.stages[0].version).toBe(2);
    });
  });

  it('deleteAllForWorkshopInvitation removes all rows', async () => {
    await inRollbackedTestTx(ds, async () => {
      const order = makeOrder({ version: 1 });
      const req = makeRequest({ orderId: order.orderId, version: 1 });
      const inv = makeWorkshopInvitation({
        orderId: order.orderId,
        workshopId: randomUUID(),
        version: 1,
      });

      const s1 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'X',
        stageOrder: 0,
        version: 1,
      });
      const s2 = makeStage({
        orderId: order.orderId,
        workshopId: inv.workshopId,
        stageName: 'Y',
        stageOrder: 1,
        version: 1,
      });

      const agg = new StagesAggregate([s1, s2]);

      await uow.run({}, async () => {
        await orderRepo.insert(order);
        await requestRepo.insert(req);
        await invitationRepo.insert(inv);
        await repo.save(agg);
      });

      await uow.run({}, async () => {
        await repo.deleteAllForWorkshopInvitation({
          orderId: order.orderId,
          workshopId: inv.workshopId,
        });
      });

      const found = await repo.findByWorkshopInvitation({
        orderId: order.orderId,
        workshopId: inv.workshopId,
      });
      expect(found).toBeNull();
    });
  });
});
