import { Logger } from '@nestjs/common';
import { LogInfoDto } from './log-info';

/**
 * Error log DTO mirroring the standard AppError shape.
 */
export interface ErrorLogDto extends LogInfoDto {
  error: unknown;
  kind?: string;
  service?: string;
  code?: string;
  retryable?: boolean;
  v?: number;
  details?: unknown;
}

/**
 * Emit a structured error log. Additional info may be supplied and will
 * overwrite existing fields.
 */
export function logError(
  dto: ErrorLogDto,
  additional: Record<string, unknown> = {},
  overrides: Record<string, unknown> = {},
): void {
  Logger.error({ ...dto, ...additional, ...overrides });
}
