import { Injectable } from '@nestjs/common';
import {
  currentManager,
  requireTxManager,
  updateWithVersionGuard,
} from 'persistence';
import { DataSource, EntityManager } from 'typeorm';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import { AdditiveBonus } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/additive-bonus/additive-bonus.entity';

@Injectable()
export class AdditiveBonusRepo {
  constructor(private readonly ds: DataSource) {}

  async findByCommissionerId(
    commissionerId: string,
  ): Promise<AdditiveBonus | null> {
    try {
      const entity: AdditiveBonus | null = await currentManager(
        this.ds,
      ).findOne(AdditiveBonus, { where: { commissionerId } });
      return entity;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async insert(additiveBonus: AdditiveBonus): Promise<void> {
    try {
      const manager: EntityManager = requireTxManager(this.ds);
      await manager.insert(AdditiveBonus, additiveBonus);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  /**
   * Enforce optimistic concurrency using either 'version' int column.
   */
  async update(additiveBonus: AdditiveBonus): Promise<void> {
    const manager = requireTxManager(this.ds);

    try {
      await updateWithVersionGuard({
        entityManager: manager,
        target: AdditiveBonus,
        pkWhere: { commissionerId: additiveBonus.commissionerId },
        entity: additiveBonus,
        set: {
          totalPoints: additiveBonus.totalPoints,
          grade: additiveBonus.grade,
          bonusPolicyVersion: additiveBonus.bonusPolicyVersion,
          gradePolicyVersion: additiveBonus.gradePolicyVersion,
        },
        currentVersion: additiveBonus.version,
      });
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }
}
