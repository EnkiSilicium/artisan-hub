// read-model/mv-vip-additive.view.ts
import { ViewColumn, ViewEntity } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
@ViewEntity({
  schema: process.env.DB_SCHEMA || 'public',
  name: 'mv_bonus_profile',
  materialized: true,
  expression: `
      SELECT
        vp.commissioner_id                         AS "commissionerId",
        vp.is_vip                                  AS "isVIP",
        vp.last_tick_at                            AS "vipLastTickAt",
        vp.last_bucket                             AS "vipLastBucket",
        vp.vip_policy_version                      AS "vipPolicyVersion",
        vp.window_algo_policy_version              AS "windowAlgoPolicyVersion",
        vp.bonus_algo_policy_version               AS "vipBonusPolicyVersion",
        vp.created_at                              AS "vipCreatedAt",
        vp.last_updated_at                         AS "vipLastUpdatedAt",

        ab.total_points                            AS "totalPoints",
        ab.grade                                   AS "grade",
        ab.bonus_algo_policy_version               AS "bonusPolicyVersion",
        ab.grade_policy_version                    AS "gradePolicyVersion",
        ab.created_at                              AS "bonusCreatedAt",
        ab.last_updated_at                         AS "bonusLastUpdatedAt",

        null::timestamptz                          AS last_refreshed_at
      FROM public.vip_profile      vp
      INNER JOIN public.additive_bonus ab
              ON ab.commissioner_id = vp.commissioner_id
    `,
  },
)

export class BonusReadProjection {
  // identity
  @ViewColumn() commissionerId!: string;
  // vip profile
  @ViewColumn() isVIP!: boolean;
  @ViewColumn() vipLastTickAt!: string;
  @ViewColumn() vipLastBucket!: number;
  @ViewColumn() vipPolicyVersion!: number;
  @ViewColumn() windowAlgoPolicyVersion!: number;
  @ViewColumn() vipBonusPolicyVersion!: number;
  @ViewColumn() vipCreatedAt!: string;
  @ViewColumn() vipLastUpdatedAt!: string;
  // additive bonus
  @ViewColumn() totalPoints!: number;
  @ViewColumn() grade!: string;
  @ViewColumn() bonusPolicyVersion!: number;
  @ViewColumn() gradePolicyVersion!: number;
  @ViewColumn() bonusCreatedAt!: string;
  @ViewColumn() bonusLastUpdatedAt!: string;

  @ViewColumn({ name: 'last_refreshed_at' }) lastRefreshedAt!: string | null;
}
