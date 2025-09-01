import { Logger } from '@nestjs/common';

/**
 * Basic shape for operational logs. These fields are optional but hint at
 * useful data points.
 */
export interface LogInfoDto {
  /** Human readable message */
  msg: string;
  controller?: string;
  method?: string;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Emit a structured log. Additional info may be supplied and will overwrite
 * existing fields.
 */
export function logInfo(
  dto: LogInfoDto,
  additional: Record<string, unknown> = {},
  overrides: Record<string, unknown> = {},
): void {
  Logger.log({ ...dto, ...additional, ...overrides });
}
