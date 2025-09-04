import { ApiProperty } from '@nestjs/swagger';

/**
 * Flattened record describing a stage within an order.
 */
export class OrderHistoryQueryResultFlatDto {
  // Order details
  @ApiProperty({ type: String, description: 'Order ID' })
  orderId!: string;

  @ApiProperty({ type: String, description: 'Current state of the order' })
  orderState!: string;

  @ApiProperty({ type: String, description: 'Commissioner ID' })
  commissionerId!: string;

  @ApiProperty({ type: Boolean, description: 'Whether the order has been terminated' })
  isTerminated!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time the order was created',
  })
  orderCreatedAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time the order was last updated',
  })
  orderLastUpdatedAt!: string;

  // Request details
  @ApiProperty({ type: String, description: 'Request title' })
  requestTitle!: string;

  @ApiProperty({ type: String, description: 'Request description' })
  requestDescription!: string;

  @ApiProperty({ type: String, description: 'Request deadline' })
  requestDeadline!: string;

  @ApiProperty({ type: String, description: 'Request budget' })
  requestBudget!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Request created timestamp',
  })
  requestCreatedAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Request updated timestamp',
  })
  requestLastUpdatedAt!: string;

  // Invitation details (nullable)
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Workshop ID, or null if none',
  })
  workshopId!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Invitation status, or null if none',
  })
  invitationStatus!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Invitation description, or null if none',
  })
  invitationDescription!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Invitation deadline, or null if none',
  })
  invitationDeadline!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Invitation budget, or null if none',
  })
  invitationBudget!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Invitation created timestamp, or null',
  })
  invitationCreatedAt!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Invitation updated timestamp, or null',
  })
  invitationLastUpdatedAt!: string | null;

  // Stage details (nullable)
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Name of the stage, or null',
  })
  stageName!: string | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Order index of the stage, or null',
  })
  stageOrder!: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Status of the stage, or null',
  })
  stageStatus!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Approximate length, or null',
  })
  approximateLength!: string | null;

  @ApiProperty({
    type: Boolean,
    nullable: true,
    description: 'Whether the stage requires confirmation, or null',
  })
  needsConfirmation!: boolean | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Stage created timestamp, or null',
  })
  stageCreatedAt!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Stage updated timestamp, or null',
  })
  stageLastUpdatedAt!: string | null;
}

/**
 * Wrapper for paginated results.
 */
export class OrderHistoryQueryResultDto {
  @ApiProperty({ type: Number, description: 'Total count across all pages' })
  total!: number;

  @ApiProperty({
    type: () => OrderHistoryQueryResultFlatDto,
    isArray: true,
    description: 'Returned items for this page',
  })
  items!: OrderHistoryQueryResultFlatDto[];
}
