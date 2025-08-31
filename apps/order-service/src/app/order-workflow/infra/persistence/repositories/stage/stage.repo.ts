import { Injectable } from '@nestjs/common';
import {
  StagesAggregate,
  Stage,
} from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity';
import { StageStatus } from '../../../../domain/entities/stage/stage-status.enum';
import { requireTxManager, updateWithVersionGuard } from 'persistence';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import { DataSource, In } from 'typeorm';

@Injectable()
export class StagesAggregateRepo {
  constructor(private readonly ds: DataSource) {}

  /**
   *
   * @param key pk
   * @returns Stages aggregate OR null if no stages found in db.
   */
  async findByWorkshopInvitation(key: {
    orderId: string;
    workshopId: string;
  }): Promise<StagesAggregate | null> {
    const manager = requireTxManager(this.ds);
    try {
      const rows = await manager.find(Stage, {
        where: { orderId: key.orderId, workshopId: key.workshopId },
        order: { stageOrder: 'ASC' },
        lock: undefined,
      });

      if (rows.length === 0) {
        return null;
      }
      return new StagesAggregate(rows);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  /**
   * Upsert the aggregate’s stages to match exactly (replace semantics).
   * - Inserts new stages with version = 1.
   * - Updates existing stages via version guard (version = version + 1).
   * - Deletes DB rows that are not present in the aggregate, when replace=true.
   *
   * It suffers from N+1, but given that the expected value of N is around 3,
   * it's not even noticeable.
   *
   * Returns the same aggregate (no copying).
   */
  async save(agg: StagesAggregate, replace = true): Promise<StagesAggregate> {
    const manager = requireTxManager(this.ds);

    try {
      if (agg.stages.length === 0) return agg;

      const { orderId, workshopId } = {
        orderId: agg.stages[0].orderId,
        workshopId: agg.stages[0].workshopId,
      };

      // Pull current DB snapshot for reconciliation
      const existing = await manager.find(Stage, {
        where: { orderId, workshopId },
        order: { stageOrder: 'ASC' },
      });

      const byKey = (s: Stage) =>
        `${s.orderId}__${s.workshopId}__${s.stageName}`;
      const existingMap = new Map(existing.map((s) => [byKey(s), s]));

      // UPSERT pass
      for (const s of agg.stages) {
        const key = byKey(s);
        const current = existingMap.get(key);

        if (!current) {
          // INSERT new stage, initialize version = 0
          await manager
            .createQueryBuilder()
            .insert()
            .into(Stage)
            .values({
              orderId: s.orderId,
              workshopId: s.workshopId,
              stageName: s.stageName,
              approximateLength: s.approximateLength,
              needsConfirmation: s.needsConfirmation,
              description: s.description,
              status: s.status ?? StageStatus.Pending,
              stageOrder: s.stageOrder,
              version: 1,
            })
            .execute();

          // keep in-memory version aligned
          s.version = 1;
        } else {
          // UPDATE guarded by version
          await updateWithVersionGuard({
            entityManager: manager,
            target: Stage,
            entity: s,
            pkWhere: {
              orderId: s.orderId,
              workshopId: s.workshopId,
              stageName: s.stageName,
            },
            set: {
              approximateLength: s.approximateLength,
              needsConfirmation: s.needsConfirmation,
              description: s.description,
              status: s.status,
              stageOrder: s.stageOrder,
            },
            currentVersion: s.version,
          });
        }
      }

      // DELETE pass (if replace=true)
      if (replace) {
        const wanted = new Set(agg.stages.map(byKey));
        const toDelete = existing.filter((s) => !wanted.has(byKey(s)));
        if (toDelete.length) {
          const names = toDelete.map((s) => s.stageName);
          await manager
            .createQueryBuilder()
            .delete()
            .from(Stage)
            .where({ orderId: orderId, workshopId: workshopId })
            .andWhere({ stageName: In(names) })
            .execute();
        }
      }

      return agg;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  /**
   * Remove all stages for a given workshopInvitation.
   */
  async deleteAllForWorkshopInvitation(key: {
    orderId: string;
    workshopId: string;
  }): Promise<void> {
    const manager = requireTxManager(this.ds);
    try {
      await manager
        .createQueryBuilder()
        .delete()
        .from(Stage)
        .where({ orderId: key.orderId, workshopId: key.workshopId })
        .execute();
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }
}
