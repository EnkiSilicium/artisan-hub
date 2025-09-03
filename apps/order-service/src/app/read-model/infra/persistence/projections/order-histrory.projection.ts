// read-model/mv-order-rq-inv-stage.view.ts
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'mv_order_history_projection',
  materialized: true,
  expression: `
    SELECT
      o.order_id           AS "orderId",
      o.state              AS "orderState",
      o.commissioner_id    AS "commissionerId",
      o.is_terminated      AS "isTerminated",
      o.created_at         AS "orderCreatedAt",
      o.last_updated_at    AS "orderLastUpdatedAt",

      r.title              AS "requestTitle",
      r.description        AS "requestDescription",
      r.deadline           AS "requestDeadline",
      r.budget             AS "requestBudget",
      r.created_at         AS "requestCreatedAt",
      r.last_updated_at    AS "requestLastUpdatedAt",

      wi.workshop_id       AS "workshopId",
      wi.status            AS "invitationStatus",
      wi.description       AS "invitationDescription",
      wi.deadline          AS "invitationDeadline",
      wi.budget            AS "invitationBudget",
      wi.created_at        AS "invitationCreatedAt",
      wi.last_updated_at   AS "invitationLastUpdatedAt",


      s.stage_name         AS "stageName",
      s.stage_order        AS "stageOrder",
      s.status             AS "stageStatus",
      s.approximate_length AS "approximateLength",
      s.needs_confirmation AS "needsConfirmation",
      s.created_at         AS "stageCreatedAt",
      s.last_updated_at    AS "stageLastUpdatedAt",

      NULL::timestamptz    AS "lastRefreshedAt",

    FROM public."order" o
    JOIN public.request r
      ON r.order_id = o.order_id
    LEFT JOIN public.workshop_invitation wi
      ON wi.order_id = o.order_id
    LEFT JOIN public.stage s
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
