import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsoDateTransformer } from 'libs/persistence/src/lib/transformers/iso-date-transformer';


@Entity({ name: 'outbox_message' })
export class OutboxMessage {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column('jsonb', { name: 'payload' })
  payload!: Record<string, unknown>;

  //@IsISO8601()
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    transformer: IsoDateTransformer,
  })
  createdAt!: string;
}
