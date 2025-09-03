import { Injectable } from '@nestjs/common';
import { LastMonthEventSet } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/last-month-event-set.entity';
import { VipProfile } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/vip-profile.entity';
import {
  currentManager,
  requireTxManager,
  setNewTimeAndVersion,
} from 'persistence';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import { DataSource, EntityManager, In } from 'typeorm';
import { isoNow } from 'shared-kernel';

@Injectable()
export class VipProfileRepo {
  constructor(private readonly ds: DataSource) {}

  async findByCommissionerId(
    commissionerId: string,
  ): Promise<VipProfile | null> {
    try {
      const entity: VipProfile | null = await currentManager(this.ds).findOne(
        VipProfile,
        { where: { commissionerId }, loadEagerRelations: true },
      );
      return entity;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async insert(vipProfile: VipProfile): Promise<void> {
    try {
      const manager: EntityManager = requireTxManager(this.ds);
      await manager.insert(VipProfile, vipProfile);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async update(vipProfile: VipProfile): Promise<void> {
    const manager = requireTxManager(this.ds);
    const now = isoNow();

    // Pull current DB snapshot for reconciliation
    try {
      const existingLastMonthEvents = await manager.find(LastMonthEventSet, {
        where: { commissionerId: vipProfile.commissionerId },
      });
      const byKey = (s: LastMonthEventSet) => `${s.eventId}`;
      const existingEventsMap = new Map(
        existingLastMonthEvents.map((s) => [byKey(s), s]),
      );
      // INSERT pass
      for (const event of vipProfile.lastMonthEvents) {
        const key = byKey(event);
        const current = existingEventsMap.get(key);

        // If not in DB, insert. Else ignore.
        if (!current) {
          setNewTimeAndVersion(1, event, true, now);
          await manager.insert(LastMonthEventSet, event);
        }
      }
      // DELETE pass
      const wanted = new Set(vipProfile.lastMonthEvents.map(byKey));
      const toDelete = existingLastMonthEvents.filter(
        (s) => !wanted.has(byKey(s)),
      );
      if (toDelete.length) {
        await manager
          .createQueryBuilder()
          .delete()
          .from(LastMonthEventSet)
          .where({ commissionerId: vipProfile.commissionerId })
          .andWhere({ eventId: In(toDelete.map((s) => s.eventId)) })
          .execute();
      }
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }
}
