import { makeRegistry } from "error-handling/error-core";
import { BaseDescriptor } from "error-handling/error-core";


export const WorkshopDomainErrorDefs = [
  {
    code: 'NOT_FOUND',
    message: 'Workshop not found',
    service: 'workshop-service',
    retryable: false,
    httpStatus: 404,
    v: 1,
  },
  {
    code: 'ALREADY_EXISTS',
    message: 'Workshop already exists',
    service: 'workshop-service',
    retryable: false,
    httpStatus: 409,
    v: 1,
  }, // business key duplicate
  {
    code: 'VALIDATION',
    message: 'Validation failed',
    service: 'workshop-service',
    retryable: false,
    httpStatus: 422,
    v: 1,
  },
  {
    code: 'CONFLICT',
    message: 'Version conflict',
    service: 'workshop-service',
    retryable: true,
    httpStatus: 409,
    v: 1,
  },
  {
    code: 'PRECONDITION_FAILED',
    message: 'Precondition failed',
    service: 'workshop-service',
    retryable: false,
    httpStatus: 412,
    v: 1,
  }, // event.g., cannot delete with active orders
  {
    code: 'CAPABILITY_UNKNOWN',
    message: 'Capability not recognized',
    service: 'workshop-service',
    retryable: false,
    httpStatus: 422,
    v: 1,
  },
  {
    code: 'CAPABILITY_IN_USE',
    message: 'Capability is in use and locked',
    service: 'workshop-service',
    retryable: false,
    httpStatus: 409,
    v: 1,
  },
] as const satisfies readonly BaseDescriptor<string>[];

export const WorkshopDomainErrorRegistry = makeRegistry(
  'DOMAIN',
  WorkshopDomainErrorDefs,
);
export const WorkshopDomainCodes = WorkshopDomainErrorRegistry.codes;
export const WorkshopDomainRegistry = WorkshopDomainErrorRegistry.byCode;
