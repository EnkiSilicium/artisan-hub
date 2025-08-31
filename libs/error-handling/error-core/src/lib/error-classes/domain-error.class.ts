import { AppError } from "error-handling/error-core";
import { BaseDescriptor } from "error-handling/error-core";



/**
 * Service-specific domain errors, such as validation errors, invalid transitions etc.
 */
export class DomainError extends AppError {
  constructor(args: {
    errorObject: BaseDescriptor<string>;
    details?: Record<string, unknown>;
    cause?: Record<string, unknown>;
  }) {
    super({ kind: 'DOMAIN', ...args });
  }
}
