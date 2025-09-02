// read-model/mv-order-rq-inv-stage.view.ts
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'mv_order_history_projection',
  materialized: true,
  expression: `
    SELECT
      o.order_id               AS order_id,
      o.state                  AS order_state,
      o.commissioner_id        AS commissioner_id,
      o.is_terminated          AS is_terminated,
      o.created_at             AS order_created_at,
      o.last_updated_at        AS order_last_updated_at,

      r.title                  AS request_title,
      r.description            AS request_description,
      r.deadline               AS request_deadline,
      r.budget                 AS request_budget,
      r.created_at             AS request_created_at,
      r.last_updated_at        AS request_last_updated_at,

      wi.workshop_id           AS workshop_id,
      wi.status                AS invitation_status,
      wi.description           AS invitation_description,
      wi.deadline              AS invitation_deadline,
      wi.budget                AS invitation_budget,
      wi.created_at            AS invitation_created_at,
      wi.last_updated_at       AS invitation_last_updated_at,

      s.stage_name             AS stage_name,
      s.stage_order            AS stage_order,
      s.status                 AS stage_status,
      s.approximate_length     AS approximate_length,
      s.needs_confirmation     AS needs_confirmation,
      s.created_at             AS stage_created_at,
      s.last_updated_at        AS stage_last_updated_at,

      null::timestamptz        AS last_refreshed_at
    FROM public."order" o
    INNER JOIN public.request r
      ON r.order_id = o.order_id
    LEFT JOIN public.workshop_invitation wi
      ON wi.order_id = o.order_id
    LEFT JOIN order.stage s
      ON s.order_id = wi.order_id
     AND s.workshop_id = wi.workshop_id
  `,
})
export class OrderHistoryProjection {
  // order
  @ViewColumn() orderId!: string;
  @ViewColumn() orderState!: string;
  @ViewColumn() commissionerId!: string;
  @ViewColumn() isTerminated!: boolean;
  @ViewColumn() orderCreatedAt!: string;
  @ViewColumn() orderLastUpdatedAt!: string;

  // request
  @ViewColumn() requestTitle!: string;
  @ViewColumn() requestDescription!: string;
  @ViewColumn() requestDeadline!: string;
  @ViewColumn() requestBudget!: string;
  @ViewColumn() requestCreatedAt!: string;
  @ViewColumn() requestLastUpdatedAt!: string;

  // invitation
  @ViewColumn() workshopId!: string | null;
  @ViewColumn() invitationStatus!: string | null;
  @ViewColumn() invitationDescription!: string | null;
  @ViewColumn() invitationDeadline!: string | null;
  @ViewColumn() invitationBudget!: string | null;
  @ViewColumn() invitationCreatedAt!: string | null;
  @ViewColumn() invitationLastUpdatedAt!: string | null;

  // stage
  @ViewColumn() stageName!: string | null;
  @ViewColumn() stageOrder!: number | null;
  @ViewColumn() stageStatus!: string | null;
  @ViewColumn() approximateLength!: string | null;
  @ViewColumn() needsConfirmation!: boolean | null;
  @ViewColumn() stageCreatedAt!: string | null;
  @ViewColumn() stageLastUpdatedAt!: string | null;

  @ViewColumn({ name: 'last_refreshed_at' }) lastRefreshedAt!: string | null;
}
