import {
  Stage,
} from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity';
import { StageStatus } from '../../../../domain/entities/stage/stage-status.enum';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

export function makeStage(over: Partial<Stage> = {}): Stage {
  const s = Object.create(Stage.prototype) as Stage;
  Object.assign(s, {
    orderId: over.orderId ?? randomUUID(),
    workshopId: over.workshopId ?? randomUUID(),
    stageName:
      over.stageName ?? `stage-${Math.random().toString(36).slice(2, 7)}`,
    approximateLength: over.approximateLength ?? '1h',
    needsConfirmation: over.needsConfirmation ?? false,
    description: over.description ?? 'desc',
    status: over.status ?? StageStatus.Pending,
    stageOrder: over.stageOrder ?? 0,
    createdAt: isoNow(),
    lastUpdatedAt: isoNow(),
    version: over.version ?? 1,
    ...over,
  });
  return s;
}
