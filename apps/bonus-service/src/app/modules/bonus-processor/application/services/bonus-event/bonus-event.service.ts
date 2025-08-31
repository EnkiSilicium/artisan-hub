import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BonusEventProcessCommand } from 'apps/bonus-service/src/app/modules/bonus-processor/application/services/bonus-event/bonus-event.command';
import { BonusEventEntity } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.entity';
import { VipProfile } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/vip-profile.entity';
import { GradePolicy } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/additive-bonus/grade.policy';
import { BonusEventRegistry } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/common/bonus-event.registy';
import { VipProfileRegistry } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/vip-profile.registry';
import { WindowAlgoRegistry } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/vip-profile/window-algo.registry';
import { AdditiveBonusRepo } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/additive-bonus/additive-bonus.repo';
import { BonusEventRepo } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/bonus-event/bonus-event.repo';
import { VipProfileRepo } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/persistence/repositories/vip-profile/vip-profile.repo';
import { enqueueOutbox, TypeOrmUoW } from 'persistence';
import { GradeAttainedEventV1, VipAccquiredEventV1 } from 'contracts';
import { randomUUID } from 'crypto';
import { AdditiveBonus } from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/additive-bonus/additive-bonus.entity';
import { isoNow } from 'shared-kernel';

@Injectable()
export class BonusEventService {
  constructor(
    private readonly uow: TypeOrmUoW,
    private readonly additiveBonusRepo: AdditiveBonusRepo,
    private readonly bonusEventRepo: BonusEventRepo,
    private readonly vipProfileRepo: VipProfileRepo,
  ) {}
  async process(cmd: BonusEventProcessCommand) {
    return this.uow.runWithRetry({}, async () => {
      const event = new BonusEventEntity({
        eventId: cmd.eventId,
        commissionerId: cmd.commissionerId,
        injestedAt: cmd.injestedAt,
        eventName: cmd.eventName,
      });

      // "Already processed" guard
      try {
        await this.bonusEventRepo.insert(event);
      } catch (error) {
        //TODO: process the DB error
        throw Error('Event already exists');
      }

      let additiveBonusExisted: boolean;
      let additiveBonusProfile: AdditiveBonus | null =
        await this.additiveBonusRepo.findByCommissionerId(cmd.commissionerId);
      if (!additiveBonusProfile) {
        additiveBonusProfile = new AdditiveBonus({
          commissionerId: cmd.commissionerId,
          gradePolicy: GradePolicy,
          bonusRegistry: BonusEventRegistry,
        });
        additiveBonusExisted = false;
      } else {
        additiveBonusExisted = true;
      }

      let vipProfileExisted: boolean;
      let vipProfile: VipProfile | null =
        await this.vipProfileRepo.findByCommissionerId(cmd.commissionerId);
      if (!vipProfile) {
        vipProfile = new VipProfile({
          commissionerId: cmd.commissionerId,
          windowAlgoRegistry: WindowAlgoRegistry,
          vipProfileRegistry: VipProfileRegistry,
          bonusRegistry: BonusEventRegistry,
        });
        vipProfileExisted = false;
      } else {
        vipProfileExisted = true;
      }

      const { gradeChanged } = additiveBonusProfile.processBonusEvent(
        event.eventName,
        BonusEventRegistry,
        GradePolicy,
      );

      const { vipGained } = vipProfile.processBonusEvent(
        {
          commissionerId: event.commissionerId,
          eventName: event.eventName,
          eventId: event.eventId,
        },
        WindowAlgoRegistry,
        VipProfileRegistry,
        BonusEventRegistry,
      );

      if (vipProfileExisted) {
        await this.vipProfileRepo.update(vipProfile);
      } else {
        await this.vipProfileRepo.insert(vipProfile);
      }

      if (additiveBonusExisted) {
        await this.additiveBonusRepo.update(additiveBonusProfile);
      } else {
        await this.additiveBonusRepo.insert(additiveBonusProfile);
      }

      if (vipGained) {
        const vipGainedPayload: VipAccquiredEventV1 = {
          eventName: 'VipAccquired',
          accquiredAt: isoNow(),
          commissionerID: vipProfile.commissionerId,
          schemaV: 1,
        };
        enqueueOutbox({
          id: randomUUID(),
          createdAt: isoNow(),
          payload: {
            ...vipGainedPayload,
          },
        });
      }

      if (gradeChanged) {
        const gradeAttainedPayload: GradeAttainedEventV1 = {
          eventName: 'GradeAttained',
          attainedAt: isoNow(),
          commissionerID: vipProfile.commissionerId,
          schemaV: 1,
          grade: additiveBonusProfile.grade,
        };
        enqueueOutbox({
          id: randomUUID(),
          createdAt: isoNow(),
          payload: {
            ...gradeAttainedPayload,
          },
        });
      }
    });
  }
}
