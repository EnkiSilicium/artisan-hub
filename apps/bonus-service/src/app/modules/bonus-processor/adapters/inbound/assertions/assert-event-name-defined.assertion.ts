import { ProgrammerError } from 'error-handling/error-core';
import { ProgrammerErrorRegistry } from 'error-handling/registries/common';

export function assertEventNameDefined({
  eventName,
}: {
  eventName: unknown;
}): asserts eventName {
  if (!eventName) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: { description: `injested event does not have eventName` },
    });
  }
}
