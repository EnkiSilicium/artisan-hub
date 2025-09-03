import { Injectable } from '@nestjs/common';
import { RequestEntity } from 'apps/order-service/src/app/order-workflow/domain/entities/request/request.entity';
import { requireTxManager, setNewTimeAndVersion, updateWithVersionGuard } from 'persistence';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import { DataSource } from 'typeorm';
import { isoNow } from 'shared-kernel';

@Injectable()
export class RequestRepo {
  constructor(private readonly ds: DataSource) { }

  async findById(
    orderId: string,
    required = true,
  ): Promise<RequestEntity | null> {
    const manager = requireTxManager(this.ds);
    try {
      const row = await manager.findOne(RequestEntity, { where: { orderId } });
      return row;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async insert(request: RequestEntity): Promise<void> {
    const manager = requireTxManager(this.ds);
    try {
      const now = isoNow();
      setNewTimeAndVersion(1, request, true, now);
      await manager.insert(RequestEntity, request);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  /**
   * Update guarded by version. Bumps version by 1 on success.
   */
  async update(request: RequestEntity): Promise<void> {
    const manager = requireTxManager(this.ds);

    try {
      await updateWithVersionGuard({
        entityManager: manager,
        target: RequestEntity,
        pkWhere: { orderId: request.orderId },
        entity: request,
        set: {
          title: request.title,
          description: request.description,
          deadline: request.deadline,
          budget: request.budget,
        },
        currentVersion: request.version,
      });
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }
}
