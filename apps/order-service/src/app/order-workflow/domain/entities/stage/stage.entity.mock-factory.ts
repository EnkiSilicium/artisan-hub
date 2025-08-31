import { Stage } from './stage.entity';
import { StageStatus } from './stage-status.enum';
import { isoNow } from 'shared-kernel';
import { randomUUID } from 'crypto';

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
