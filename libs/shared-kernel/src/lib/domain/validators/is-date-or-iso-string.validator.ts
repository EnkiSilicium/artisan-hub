// validators/is-date-or-iso-string.ts
import { ValidateBy, buildMessage } from 'class-validator';
// class-validator depends on 'validator', so this import works out of the box
// If your toolchain is ESM, keep the "" suffix; otherwise drop it.
import isISO8601 from 'validator/lib/isISO8601';

export function IsDateOrIsoString() {
  return ValidateBy({
    name: 'isDateOrIsoString',
    validator: {
      validate: (v: unknown) =>
        (v instanceof Date && !Number.isNaN(v.getTime())) ||
        (typeof v === 'string' && isISO8601(v, { strict: true })),
      defaultMessage: buildMessage(
        () => 'must be a Date object or an ISO 8601 string',
      ),
    },
  });
}
