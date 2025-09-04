// read-model/mv-vip-additive.repo.ts
import { BonusReadProjection } from 'apps/bonus-service/src/app/modules/read-projection/infra/persistence/projections/bonus-read.projection';
import { BonusReadQuery } from 'apps/bonus-service/src/app/modules/read-projection/application/bonus-read/bonus-read.query';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { remapTypeOrmPgErrorToInfra } from 'error-handling/remapper/typeorm-postgres';

@Injectable()
export class BonusReadRepo {
  constructor(private readonly ds: DataSource) { }

  private qb(): SelectQueryBuilder<BonusReadProjection> {
    return this.ds.getRepository(BonusReadProjection).createQueryBuilder('v');
  }

  async read(f: BonusReadQuery) {
    const {
      commissionerId,
      isVIP,
      grade,
      minTotalPoints,
      maxTotalPoints,
      vipPolicyVersion,
      bonusPolicyVersion,
      gradePolicyVersion,
      createdFrom,
      createdTo,
      limit = 50,
      offset = 0,
      sort = 'vipLastUpdatedAt',
      sortDir = 'desc',
    } = f;

    const q = this.qb();

    if (commissionerId)
      q.andWhere('v.commissionerId = :commissionerId', { commissionerId });
    if (typeof isVIP === 'boolean') q.andWhere('v.isVIP = :isVIP', { isVIP });
    if (grade) q.andWhere('v.grade = :grade', { grade });

    if (minTotalPoints != null)
      q.andWhere('v.totalPoints >= :minTotalPoints', { minTotalPoints });
    if (maxTotalPoints != null)
      q.andWhere('v.totalPoints <= :maxTotalPoints', { maxTotalPoints });

    if (vipPolicyVersion != null)
      q.andWhere('v.vipPolicyVersion = :vipPolicyVersion', {
        vipPolicyVersion,
      });
    if (bonusPolicyVersion != null)
      q.andWhere('v.bonusPolicyVersion = :bonusPolicyVersion', {
        bonusPolicyVersion,
      });
    if (gradePolicyVersion != null)
      q.andWhere('v.gradePolicyVersion = :gradePolicyVersion', {
        gradePolicyVersion,
      });

    if (createdFrom)
      q.andWhere('v.vipCreatedAt >= :createdFrom', { createdFrom });
    if (createdTo) q.andWhere('v.vipCreatedAt < :createdTo', { createdTo });

    q.orderBy(`v.${sort}`, (sortDir ?? 'desc').toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('v.commissionerId', 'ASC')
      .take(limit)
      .skip(offset);

    try {
      const [rows, total] = await Promise.all([q.getMany(), this.countFor(q)]);
      return { total, rows };
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);

    }


  }

  private async countFor(
    base: SelectQueryBuilder<BonusReadProjection>,
  ): Promise<number> {
    const c = base.clone().select('COUNT(*)', 'c').orderBy();
    const row = await c.getRawOne<{ c: string }>();
    return Number(row?.c ?? 0);
  }

  /** Materialized view must be refreshed explicitly. */
  async refresh(): Promise<void> {
    try {
      await this.ds.query(
        'REFRESH MATERIALIZED VIEW mv_bonus_profile',
      );
    } catch (error) {
      remapTypeOrmPgErrorToInfra(error);

    }
  }
}
