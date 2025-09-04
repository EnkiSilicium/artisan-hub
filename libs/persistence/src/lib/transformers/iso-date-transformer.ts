import type { ValueTransformer } from 'typeorm';
/** Maps string <-> Date for timestamptz columns; property type stays `string` in code. */
export const IsoDateTransformer: ValueTransformer = {
  to: (value?: string | null) => (value == null ? value : new Date(value)),
  from: (value?: Date | null) => (value == null ? value : value.toISOString()),
};
