import type { ValueTransformer } from 'typeorm';
/** Maps string <-> Date for timestamptz columns; property type stays `string` in code. */
export const IsoDateTransformer: ValueTransformer = {
  to: (value?: any | null) =>
    value == null ||
      (value as any) instanceof Date ? value
      : typeof (value as any) == 'string' || 'number' ? new Date(value)
        : 'not-a-data, check transformer',
  from: (value?: Date | null) => (value == null ? value : value.toISOString()),
};
