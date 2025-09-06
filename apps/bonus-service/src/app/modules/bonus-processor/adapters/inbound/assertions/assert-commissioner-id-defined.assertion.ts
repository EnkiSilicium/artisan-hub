import { ProgrammerError } from 'error-handling/error-core';
import { ProgrammerErrorRegistry } from 'error-handling/registries/common';

interface AssertCommissionerIdDefinedParams {
  commissionerId: unknown;
  eventName?: string;
}

export function assertCommissionerIdDefined({
  commissionerId,
  eventName,
}: AssertCommissionerIdDefinedParams): asserts commissionerId {
  if (!commissionerId) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description: `injested event named [${eventName}] does not have commissionerId`,
      },
    });
  }
}
