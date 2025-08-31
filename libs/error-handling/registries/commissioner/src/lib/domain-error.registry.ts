import { makeRegistry } from "error-handling/error-core";
import { BaseDescriptor } from "error-handling/error-core";

export const CommissionerDomainErrorDefs = [
  {
    code: 'NOT_FOUND',
    message: 'Commissioner not found',
    service: 'commissioner-service',
    retryable: false,
    httpStatus: 404,
    v: 1,
  },
  {
    code: 'ALREADY_EXISTS',
    message: 'Commissioner already exists',
    service: 'commissioner-service',
    retryable: false,
    httpStatus: 409,
    v: 1,
  }, // event.g., unique email
  {
    code: 'VALIDATION',
    message: 'Validation failed',
    service: 'commissioner-service',
    retryable: false,
    httpStatus: 422,
    v: 1,
  },
  {
    code: 'FORBIDDEN',
    message: 'Action not permitted',
    service: 'commissioner-service',
    retryable: false,
    httpStatus: 403,
    v: 1,
  },
  {
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    service: 'commissioner-service',
    retryable: false,
    httpStatus: 401,
    v: 1,
  },
  {
    code: 'CONFLICT',
    message: 'Version conflict',
    service: 'commissioner-service',
    retryable: true,
    httpStatus: 409,
    v: 1,
  },
] as const satisfies readonly BaseDescriptor<string>[];

export const CommissionerDomainErrorRegistry = makeRegistry(
  'DOMAIN',
  CommissionerDomainErrorDefs,
);
export const CommissionerDomainCodes = CommissionerDomainErrorRegistry.codes;
export const CommissionerDomainRegistry =
  CommissionerDomainErrorRegistry.byCode;
