import { Injectable } from '@nestjs/common';
import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import {
  currentManager,
  requireTxManager,
  setNewTimeAndVersion,
  updateWithVersionGuard,
} from 'persistence';
import { DataSource } from 'typeorm';
import {remapTypeOrmPgErrorToInfra} from 'error-handling/remapper/typeorm-postgres'

@Injectable()
export class OrderRepo {
  constructor(private readonly ds: DataSource) {}

  async findById(orderId: string): Promise<Order | null> {
    try {
      const entity: Order | null = await currentManager(this.ds).findOne(
        Order,
        { where: { orderId } },
      );
      return entity;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async insert(order: Order): Promise<void> {
    const manager = requireTxManager(this.ds);
    try {
      const setCreatedAt = true;
      setNewTimeAndVersion(1, order, setCreatedAt);

      await manager.insert(Order, order);
    } catch (error) {}
  }

  async update(order: Order): Promise<void> {
    const manager = requireTxManager(this.ds);

    try {
      await updateWithVersionGuard({
        entityManager: manager,
        target: Order,
        entity: order,
        set: {
          commissionerId: order.commissionerId,
          state: order.state.stateName ?? order.state,
          isTerminated: order.isTerminated,
          createdAt: order.createdAt,
        },
        currentVersion: order.version,
      });
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }
}
