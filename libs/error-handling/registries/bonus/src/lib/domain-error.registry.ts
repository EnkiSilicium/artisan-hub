import { makeRegistry } from "error-handling/error-core";
import { BaseDescriptor } from "error-handling/error-core";


export const BonusDomainErrorDefs = [
  {
    code: 'NOT_FOUND',
    message: 'Bonus profile not found',
    service: 'bonus-service',
    retryable: false,
    httpStatus: 404,
    v: 1,
  },
  {
    code: 'VALIDATION',
    message: 'Validation failed',
    service: 'bonus-service',
    retryable: false,
    httpStatus: 422,
    v: 1,
  },
  {
    code: 'PRECONDITION_FAILED',
    message: 'Precondition failed',
    service: 'bonus-service',
    retryable: false,
    httpStatus: 412,
    v: 1,
  },
    {
    code: 'INVARIANTS_VIOLATED',
    message: 'Invariants violated',
    service: 'bonus-service',
    retryable: false,
    httpStatus: 409,
    v: 1,
  },
    {
    code: 'POLICY_VERSION_CONFLICT',
    message: 'Policy version mismatch',
    service: 'bonus-service',
    retryable: false,
    httpStatus: 409,
    v: 1,
  },
  {
    code: 'ILLEGAL_TRANSITION',
    message: 'Illegal status transition',
    service: 'bonus-service',
    retryable: false,
    httpStatus: 409,
    v: 1,
  }, // event.g., VIP downgrade not allowed
  {
    code: 'EVENT_REPLAY',
    message: 'Event already processed',
    service: 'bonus-service',
    retryable: false,
    httpStatus: 409,
    v: 1,
  }, // idempotency hit
] as const satisfies readonly BaseDescriptor<string>[];

export const BonusDomainErrorRegistry = makeRegistry(
  'DOMAIN',
  BonusDomainErrorDefs,
);
export const BonusDomainCodes = BonusDomainErrorRegistry.codes;
