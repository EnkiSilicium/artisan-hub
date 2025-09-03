import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  Check,
  UpdateDateColumn,
  OneToMany,
  VersionColumn,
  CreateDateColumn,
} from 'typeorm';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  IsOptional,
} from 'class-validator';

import {
  EntityTechnicalsInterface,
  IsoDateTransformer,
} from 'persistence';
import { Order } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.entity';
import { WorkshopInvitation } from 'apps/order-service/src/app/order-workflow/domain/entities/workshop-invitation/workshop-invitation.entity';
import { assertValid } from 'shared-kernel';
import { OrderDomainErrorRegistry } from 'error-handling/registries/order';

/**
 * A part of the Order containing lots of static data, such as description.
 * Contains ".edit" logic independent of the workflow state, hence separated.
 */
@Check('chk_request_title_nonempty', `char_length(title) >= 1`)
@Entity({ name: 'request' })
export class RequestEntity implements EntityTechnicalsInterface {
  @IsUUID()
  @PrimaryColumn('uuid', { name: 'order_id' })
  orderId!: string;

  @OneToOne(() => Order, (o) => o.request, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'orderId' })
  order!: Order;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  @Column('varchar', { name: 'title', length: 200 })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @Column('text', { name: 'description' })
  description!: string;

  //@IsISO8601()
  @Column({
    name: 'deadline',
    type: 'timestamptz',
    transformer: IsoDateTransformer,
  })
  deadline!: string;

  @IsString()
  @IsNotEmpty()
  @Column('varchar', { name: 'budget', length: 64 })
  budget!: string;

  //@IsISO8601()
  @UpdateDateColumn({
    name: 'last_updated_at',
    type: 'timestamptz',
    transformer: IsoDateTransformer,
  })
  lastUpdatedAt!: string;

  //@IsISO8601()
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    transformer: IsoDateTransformer,
  })
  createdAt!: string;


  @IsOptional()
  @IsInt()
  @VersionColumn({ name: 'version', type: 'int' })
  version!: number;

  @OneToMany(() => WorkshopInvitation, (o) => o.request, { eager: false })
  workshopInvitations!: WorkshopInvitation[];

  constructor(init: {
    orderId: string;
    title: string;
    description: string;
    deadline: string;
    budget: string;
  }) {
    // typeorm fix
    if (!init) return;

    this.orderId = init.orderId;
    this.title = init.title;
    this.description = init.description;
    this.deadline = init.deadline;
    this.budget = init.budget;

    assertValid(this, OrderDomainErrorRegistry);
  }

  editBudget(newbBudget: string): void {
    const oldBudget = this.budget;

    this.budget = newbBudget;

    try {
      assertValid(this, OrderDomainErrorRegistry);
    } catch (Error) {
      this.budget = oldBudget;

      throw Error;
    }
  }

  editDescription(newDescription: string): void {
    const olddescription = this.description;
    this.description = newDescription;

    try {
      assertValid(this, OrderDomainErrorRegistry);
    } catch (Error) {
      this.description = olddescription;

      throw Error;
    }
  }

  editDeadline(newDeadline: string): void {
    const oldDeadline = this.deadline;
    this.deadline = newDeadline;

    try {
      assertValid(this, OrderDomainErrorRegistry);
    } catch (Error) {
      this.deadline = oldDeadline;

      throw Error;
    }
  }
}
