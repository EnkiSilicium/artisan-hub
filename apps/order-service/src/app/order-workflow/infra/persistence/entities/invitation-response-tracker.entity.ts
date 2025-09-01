import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'invitation_response_tracker' })
export class InvitationResponseTracker {
  @PrimaryColumn({ name: 'order_id' })
  orderId!: string;

  @Column({ name: 'commissioner_id' })
  commissionerId!: string;

  @Column({ name: 'total' })
  total!: number;

  @Column({ name: 'responses' })
  responses!: number;

  @Column({ name: 'declines' })
  declines!: number;
}
