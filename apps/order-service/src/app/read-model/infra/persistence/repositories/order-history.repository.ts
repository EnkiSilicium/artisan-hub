// read-model/mv-order-rq-inv-stage.repo.ts
import { OrderHistoryProjection } from 'apps/order-service/src/app/read-model/infra/persistence/projections/order-histrory.projection';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';
import { DataSource, SelectQueryBuilder } from 'typeorm';

export type OrderStageFlatQuery = {
  commissionerId?: string;
  orderState?: string;
  invitationStatus?: string;
  stageStatus?: string;
  workshopId?: string;

  orderCreatedFrom?: string;
  orderCreatedTo?: string;

  limit?: number;
  offset?: number;
  sort?: 'orderCreatedAt' | 'orderLastUpdatedAt' | 'stageOrder';
  sortDir?: 'asc' | 'desc';
};

export class OrderStageFlatRepo {
  constructor(private readonly ds: DataSource) {}

  private qb(): SelectQueryBuilder<OrderHistoryProjection> {
    return this.ds
      .getRepository(OrderHistoryProjection)
      .createQueryBuilder('v');
  }

  async read(
    query: OrderStageFlatQuery,
  ): Promise<{ total: number; rows: OrderHistoryProjection[] }> {
    const {
      commissionerId,
      orderState,
      invitationStatus,
      stageStatus,
      workshopId,
      orderCreatedFrom,
      orderCreatedTo,
      limit = 50,
      offset = 0,
      sort = 'orderCreatedAt',
      sortDir = 'desc',
    } = query;

    const q = this.qb();

    if (commissionerId)
      q.andWhere('v.commissionerId = :commissionerId', { commissionerId });
    if (orderState) q.andWhere('v.orderState = :orderState', { orderState });
    if (invitationStatus)
      q.andWhere('v.invitationStatus = :invitationStatus', {
        invitationStatus,
      });
    if (stageStatus)
      q.andWhere('v.stageStatus = :stageStatus', { stageStatus });
    if (workshopId) q.andWhere('v.workshopId = :workshopId', { workshopId });

    if (orderCreatedFrom)
      q.andWhere('v.orderCreatedAt >= :orderCreatedFrom', { orderCreatedFrom });
    if (orderCreatedTo)
      q.andWhere('v.orderCreatedAt < :orderCreatedTo', { orderCreatedTo });

    q.orderBy(`v.${sort}`, (sortDir ?? 'desc').toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('v.orderId', 'ASC')
      .addOrderBy('v.workshopId', 'ASC', 'NULLS LAST')
      .addOrderBy('v.stageName', 'ASC', 'NULLS LAST')
      .take(limit)
      .skip(offset);

    try {
      const [rows, total] = await Promise.all([q.getMany(), this.countFor(q)]);
      return { total, rows };
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  /** Materialized → you must refresh explicitly (this uses one tiny SQL statement; no QB). */
  async refresh(): Promise<void> {
    try {
      await this.ds.query(
        'REFRESH MATERIALIZED VIEW mv_order_history_projection',
      );
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }

  private async countFor(
    base: SelectQueryBuilder<OrderHistoryProjection>,
  ): Promise<number> {
    try {
      const c = base.clone().select('COUNT(*)', 'c').orderBy();
      const row = await c.getRawOne<{ c: string }>();
      return Number(row?.c ?? 0);
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);
    }
  }
}
