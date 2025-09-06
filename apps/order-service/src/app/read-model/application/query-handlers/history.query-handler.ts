import { Injectable } from '@nestjs/common';
import { toOrderStageFlatPageDto } from 'apps/order-service/src/app/read-model/application/query-handlers/history-mapper';
import {
  OrderStageFlatQuery,
  OrderStageFlatRepo,
} from 'apps/order-service/src/app/read-model/infra/persistence/repositories/order-history.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class OrderStagesReadService {
  private readonly repo: OrderStageFlatRepo;

  constructor(ds: DataSource) {
    this.repo = new OrderStageFlatRepo(ds);
  }

  async read(query: OrderStageFlatQuery) {
    const { total, rows } = await this.repo.read(query);
    return toOrderStageFlatPageDto(total, rows);
  }

  async refresh() {
    await this.repo.refresh();
    return { ok: true };
  }
}
