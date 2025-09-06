import { ProgrammerError } from 'error-handling/error-core';
import { ProgrammerErrorRegistry } from 'error-handling/registries/common';
import type { BaseEvent } from 'contracts';

interface MaybeEvent {
  eventName?: unknown;
  commissionerId?: unknown;
}

export function assertsCanBeBonusEvent(
  event: MaybeEvent,
): asserts event is BaseEvent<string> & { commissionerId: string } {

  const eventName = event?.eventName
  const commissionerId = event?.commissionerId

  if (!eventName) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: { description: `injested event does not have eventName` },
    });
  }

  if (!commissionerId) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description: `injested event named [${eventName}] does not have commissionerId`,
      },
    });
  }
}
