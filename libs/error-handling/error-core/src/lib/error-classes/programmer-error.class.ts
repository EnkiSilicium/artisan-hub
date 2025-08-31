import { AppError } from "error-handling/error-core";
import { BaseDescriptor } from "error-handling/error-core";


/**
 * Errors should never occur in production under normal circumstances - 
 * utilized for debugging and explicitly indicating function misuse cases.
 */
export class ProgrammerError extends AppError {
  constructor(args: {
    errorObject: BaseDescriptor<string>;
    details?: Record<string, unknown>;
    cause?: Record<string, unknown>;
  }) {
    super({ kind: 'PROGRAMMER', ...args });
  }
}
