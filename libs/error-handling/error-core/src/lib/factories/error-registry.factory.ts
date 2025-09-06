import type { BaseDescriptor } from 'error-handling/error-core';
import type { ErrorRegistryInterface } from 'error-handling/error-core';

/**
 * Build a closed, non-extendable registry for a single service and kind.
 * `kind` is used only to form the human-readable name.
 */

export function makeRegistry<const D extends readonly BaseDescriptor<string>[]>(
  kind: 'DOMAIN' | 'INFRA' | 'PROGRAMMER',
  defs: D,
): ErrorRegistryInterface<D[number]['code']> {
  if (defs.length === 0) throw new Error('Empty error registry');
  const service = defs[0].service;
  for (const d of defs)
    if (d.service !== service) {
      throw new Error(
        `Mixed "service" values in one registry (${service} vs ${d.service})`,
      );
    }

  type C = D[number]['code'];

  const byCode = Object.freeze(
    defs.reduce(
      (acc, d) => {
        (acc as any)[d.code] = Object.freeze({ ...d });
        return acc;
      },
      {} as { [K in C]: BaseDescriptor<K> },
    ),
  );

  const codes = Object.freeze(
    defs.reduce(
      (acc, d) => {
        (acc as any)[d.code] = d.code;
        return acc;
      },
      {} as { [K in C]: K },
    ),
  );

  const toPascal = (s: string) =>
    s.replace(/(^\w|[-_]\w)/g, (m) => m.replace(/[-_]/, '').toUpperCase());
  const name = `${toPascal(service)}_${kind}`;

  return Object.freeze({
    name,
    service,
    byCode,
    codes,
    list: Object.freeze([...defs]) as ReadonlyArray<BaseDescriptor<C>>,
  });
}
