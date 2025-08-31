import { Injectable } from '@nestjs/common';
import { BonusEventEntity } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.entity';
import {
  currentManager,
  requireTxManager,
} from 'persistence';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import { DataSource, EntityManager} from 'typeorm';

@Injectable()
export class BonusEventRepo {
  constructor(private readonly ds: DataSource) {}

  async findByCommissionerId(
    commissionerId: string,
  ): Promise<BonusEventEntity | null> {
    try {
      const entity: BonusEventEntity | null = await currentManager(this.ds).findOne(
        BonusEventEntity,
        { where: { commissionerId } },
      );
      return entity;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async findByEventId(eventId: string): Promise<BonusEventEntity | null> {
    try {
      const entity: BonusEventEntity | null = await currentManager(this.ds).findOne(
        BonusEventEntity,
        { where: { eventId } },
      );
      return entity;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async insert(bonusEventEntity: BonusEventEntity): Promise<void> {
    try {
      const manager: EntityManager = requireTxManager(this.ds);
      await manager.insert(BonusEventEntity, bonusEventEntity);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  // Not updateable (?)
  /*  
  async update(BonusEventEntity: BonusEventEntity): Promise<void> {
      const manager = requireTxManager(this.ds);
  
      const next = await updateWithVersionGuard({
        entityManager: manager,
        target: BonusEventEntity,
        pkWhere: { eventId: BonusEventEntity.commissionerId },
        set: {
          grade: BonusEventEntity.grade,
          bonusPolicyVersion: BonusEventEntity.bonusPolicyVersion,
          gradePolicyVersion: BonusEventEntity.gradePolicyVersion,
        },
        currentVersion: BonusEventEntity.version,
    });
    BonusEventEntity.version = next
  
    }
  */
}
