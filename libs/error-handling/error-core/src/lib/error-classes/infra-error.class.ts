import { AppError } from "error-handling/error-core";
import { BaseDescriptor } from "error-handling/error-core";


/**
 * Non-service specific infra errors, such as optimistic locks, connection errors and such.
 * Usually obtained by intercepting ORM errors and parsing them into that.
 */
export class InfraError extends AppError {
  constructor(args: {
    errorObject: BaseDescriptor<string>;
    details?: Record<string, unknown>;
    cause?: Record<string, unknown>;
  }) {
    super({ kind: 'INFRA', ...args });
  }
}
