import type { ValueTransformer } from 'typeorm';

/** Maps string <-> number for numeric/decimal columns to avoid float drift in userland. */
export const NumericStringTransformer: ValueTransformer = {
  to: (value?: string | null) => (value == null ? value : Number(value)), // rely on DB precision, not JS
  from: (value?: number | null) => (value == null ? value : value.toString()),
};
