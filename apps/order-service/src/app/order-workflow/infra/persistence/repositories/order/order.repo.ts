import { Injectable } from '@nestjs/common';
import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import { OrderStates } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.enum';
import { StateRegistry } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.state';
import { StateClassUnion } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.type';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import {
  currentManager,
  requireTxManager,
  setNewTimeAndVersion,
  updateWithVersionGuard,
} from 'persistence';
import { DataSource } from 'typeorm';

@Injectable()
export class OrderRepo {
  constructor(private readonly ds: DataSource) {}

  async findById(orderId: string): Promise<Order | null> {
    try {
      const entity: Order | null = await currentManager(this.ds).findOne(
        Order,
        { where: { orderId } },
      );
      const status = entity?.state as unknown as OrderStates;
      //Reconstruct state object from name stored in DB
      if (entity && status) {
        entity.state = new StateRegistry[status]();
      }
      return entity;
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  async insert(order: Order): Promise<void> {
    const manager = requireTxManager(this.ds);
    try {
      //We store the state name, not the object
      //Reconstruct in findById
      const state: StateClassUnion = order.state;
      (order.state as unknown as OrderStates) = state.stateName;

      const setCreatedAt = true;
      setNewTimeAndVersion(1, order, setCreatedAt);

      await manager.insert(Order, order);

      order.state = state; //restore object in case caller relies on it
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
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
          state: order.state.stateName as unknown as StateClassUnion, // hack to store the name instead of the object
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
