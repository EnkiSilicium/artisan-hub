import { randomUUID } from 'crypto';

import { isoNow } from 'shared-kernel';

import { StageStatus } from './stage-status.enum';
import { Stage } from './stage.entity';

export function makeStage(over: Partial<Stage> = {}): Stage {
  const s = Object.create(Stage.prototype) as Stage;
  Object.assign(s, {
    orderId: randomUUID(),
    workshopId: randomUUID(),
    stageName: `stage-${Math.random().toString(36).slice(2, 7)}`,
    approximateLength: '1h',
    needsConfirmation: false,
    description: 'desc',
    status: StageStatus.Pending,
    stageOrder: 0,
    createdAt: isoNow(),
    lastUpdatedAt: isoNow(),
    version: 1,
    ...over,
  });
  return s;
}
