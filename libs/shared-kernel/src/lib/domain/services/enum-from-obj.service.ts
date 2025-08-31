/**
 * Turns an object's own string keys into an enum-like object:
 *   { a: 1, b: 2 } -> { a: 'a', b: 'b' } (frozen)
 *
 * Type:
 *   makeFieldEnum(obj) returns { [K in keyof obj & string]: K }
 *   so Fields.a is exactly the type 'a', not just string.
 */
export type FieldEnum<T extends object> = {
  readonly [K in Extract<keyof T, string>]: K;
};

export function makeFieldEnum<T extends object>(obj: T): FieldEnum<T> {
  const out = Object.create(null) as Record<string, string>;
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      out[k] = k;
    }
  }
  return Object.freeze(out) as FieldEnum<T>;
}
