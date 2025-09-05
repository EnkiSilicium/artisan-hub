// read-model/vip-additive.read.service.ts
import { Injectable } from '@nestjs/common';
import { toBonusReadresultDto } from 'apps/bonus-service/src/app/modules/read-projection/application/bonus-read/bonus-read.mapper';
import { BonusReadRepo } from 'apps/bonus-service/src/app/modules/read-projection/infra/persistence/repositories/bonus-read.repository';
import { DataSource } from 'typeorm';

import { BonusReadQuery } from './bonus-read.query';

@Injectable()
export class BonusReadHandler {
  private readonly repo: BonusReadRepo;

  constructor(ds: DataSource) {
    this.repo = new BonusReadRepo(ds);
  }

  async read(query: BonusReadQuery) {
    const { total, rows } = await this.repo.read(query);
    return toBonusReadresultDto(total, rows);
  }

  async refresh() {
    await this.repo.refresh();
    return { ok: true };
  }
}
