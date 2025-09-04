import { IsoDateTransformer } from 'libs/persistence/src/lib/transformers/iso-date-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import type { BaseEvent } from 'libs/contracts/src/_common/base-event.event';

@Entity({ name: 'outbox_message' })
export class OutboxMessage<event extends BaseEvent<string>> {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column('jsonb', { name: 'payload' })
  payload!: BaseEvent<event['eventName']>;

  //@IsISO8601()
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    transformer: IsoDateTransformer,
  })
  createdAt!: string;
}
