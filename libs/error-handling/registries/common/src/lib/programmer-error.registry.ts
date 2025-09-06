// PROGRAMMER registry

import { makeRegistry } from 'error-handling/error-core';

export const ProgrammerErrorDefs = [
  {
    code: 'BUG',
    message: 'Internal invariant violated',
    service: 'unspecified',
    retryable: false,
    httpStatus: 500,
    v: 1,
  },
] as const;

export const ProgrammerErrorRegistry = makeRegistry(
  'PROGRAMMER',
  ProgrammerErrorDefs,
);
export const ProgrammerErrorCodes = ProgrammerErrorRegistry.codes;
