import { Injectable } from '@nestjs/common';
import { WorkshopInvitation } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.entity';

import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import { currentManager, requireTxManager, setNewTimeAndVersion, updateWithVersionGuard } from 'persistence';
import { isoNow } from 'shared-kernel';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class WorkshopInvitationRepo {
  constructor(private readonly ds: DataSource) {}

  async findById(
    orderId: string,
    workshopId: string,
  ): Promise<WorkshopInvitation | null> {
    return currentManager(this.ds).findOne(WorkshopInvitation, {
      where: { orderId, workshopId },
    });
  }

  async findAllByOrderId(
    orderId: string,
  ): Promise<WorkshopInvitation[] | null> {
    return currentManager(this.ds).find(WorkshopInvitation, {
      where: { orderId },
    });
  }

  async insert(workshopInvitation: WorkshopInvitation): Promise<void> {
    const manager: EntityManager = requireTxManager(this.ds);

    try {
      const now = isoNow();
      setNewTimeAndVersion(1, workshopInvitation, true, now);

      await manager.insert(WorkshopInvitation, workshopInvitation);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async insertMany(workshopInvitations: WorkshopInvitation[]): Promise<void> {
    const manager: EntityManager = requireTxManager(this.ds);

    try {
      const now = isoNow();
      for (const workshopInv of workshopInvitations) {
        setNewTimeAndVersion(1, workshopInv, true, now);
      }

      await manager.insert(WorkshopInvitation, workshopInvitations);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async update(workshopInvitation: WorkshopInvitation): Promise<void> {
    const manager: EntityManager = requireTxManager(this.ds);

    try {
      await updateWithVersionGuard({
        entityManager: manager,
        target: WorkshopInvitation,
        entity: workshopInvitation,
        set: {
          status: workshopInvitation.status,
          description: workshopInvitation.description ?? null,
          budget: workshopInvitation.budget ?? null,
          deadline: workshopInvitation.deadline ?? null,
        },
        currentVersion: workshopInvitation.version,
      });
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }

    //if (hasVersion) (workshopInvitation as any).version += 1;
    //workshopInvitation.lastEditedAt = set.last_edited_at as string;
  }
}
