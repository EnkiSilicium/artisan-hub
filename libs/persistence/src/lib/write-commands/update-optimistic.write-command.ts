import { ProgrammerError, InfraError} from 'error-handling/error-core';
import {ProgrammerErrorRegistry, InfraErrorRegistry} from 'error-handling/registries/common'
import { isoNow } from 'shared-kernel';
import { EntityManager, ObjectType } from 'typeorm';

/**
 * A function enforcing optimistic concurerncy on insert.
 * Also bumps in-memory entity's version and 'lastUpdated'.
 * 
 * @param input
 * @returns current version
 */
export async function updateWithVersionGuard<T extends object>(
  input: {
  entityManager: EntityManager;
  target: ObjectType<T>;
  /** fields to update (ENTITY PROPERTY NAMES) */
  set: Partial<T>;
  /** current in-memory version (must be > 0) */
  currentVersion: number;
  /**
   * PK filter (ENTITY PROPERTY NAMES).
   * If omitted, we will try to derive it from `entity` using PK metadata.
   */
  pkWhere?: Partial<T>;
  /** optional in-memory entity to bump time+version */
  entity?: T & { version: number; lastUpdatedAt?: string; };
}
): Promise<number> {
  const { entityManager, target, currentVersion } = input;

  // TypeORM 0.3 uses dataSource; older code sometimes exposes connection
  const ds =
    (entityManager as any).dataSource ?? (entityManager as any).connection;
  const meta = ds.getMetadata(target);

  if (!Number.isInteger(currentVersion) || currentVersion <= 0) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description: `version must be a positive integer; do not use ${updateWithVersionGuard.name} for inserts`,
      },
    });
  }

  // Resolve version column name from entity metadata (fallback is 'version')
  const versionProperty =
    meta.columns.find((c: any) => c.isVersion)?.propertyName ?? 'version';

  // Resolve PK property names
  const pkProps: string[] = meta.primaryColumns.map((c: any) => c.propertyName);
  if (pkProps.length === 0) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: { description: `entity ${meta.name} has no primary key` },
    });
  }

  // Build pkWhere from input or from the entity instance
  let pkWhere: Record<string, unknown> | undefined =
    (input.pkWhere as Record<string, unknown> | undefined) ??
    (input.entity
      ? Object.fromEntries(
          pkProps.map((p) => [p, (input.entity as any)[p]]),
        )
      : undefined);

  // Validate pkWhere completeness and values
  if (!pkWhere || typeof pkWhere !== 'object' || Array.isArray(pkWhere)) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: {
        description:
          `'pkWhere' must be an object with all PKs, or provide 'entity' so PKs can be derived`,
      },
    });
  }
  for (const pk of pkProps) {
    const v = (pkWhere as any)[pk];
    if (v === undefined || v === null) {
      throw new ProgrammerError({
        errorObject: ProgrammerErrorRegistry.byCode.BUG,
        details: {
          description: `missing PK field '${pk}' in pkWhere/entity for ${meta.name}`,
        },
      });
    }
  }

  // Prepare SET payload
  if (!input.set || typeof input.set !== 'object' || Array.isArray(input.set)) {
    throw new ProgrammerError({
      errorObject: ProgrammerErrorRegistry.byCode.BUG,
      details: { description: `'set' must be a non-array object` },
    });
  }

  const now = isoNow();
  const setInput = { ...(input.set as any) };

  // Forbid PK updates
  for (const pk of pkProps) {
    if (pk in setInput) {
      throw new ProgrammerError({
        errorObject: ProgrammerErrorRegistry.byCode.BUG,
        details: { description: `attempt to update primary key property '${pk}'` },
      });
    }
  }

  // Scrub accidental version from SET; add lastUpdatedAt only if present on the entity
  delete setInput[versionProperty];
  const hasLastUpdated =
    meta.columns.some((c: any) => c.propertyName === 'lastUpdatedAt');
  if (hasLastUpdated) {
    setInput['lastUpdatedAt'] = now;
  }

  // Build WHERE: PKs + optimistic guard on current version
  const whereObj = {
    ...(pkWhere as object),
    [versionProperty]: currentVersion,
  } as Record<string, unknown>;

  // Execute single atomic update
  const qb = entityManager
    .createQueryBuilder()
    .update(target)
    .set({
      ...setInput,
      [versionProperty]: currentVersion + 1,
    })
    .where(whereObj);

  const res = await qb.execute();

  if (res.affected !== 1) {
    // not found or stale version, both are optimistic misses
    const id = Object.fromEntries(pkProps.map((p) => [p, (pkWhere as any)[p]]));
    throw new InfraError({
      errorObject: InfraErrorRegistry.byCode.TX_CONFLICT,
      details: {description: "Optimistic lock error"}
    })

  }

  // Bump the in-memory entity if provided
  if (input.entity) {
    (input.entity as any)[versionProperty] = currentVersion + 1;
    if (hasLastUpdated) (input.entity as any)['lastUpdatedAt'] = now;
  }

  return currentVersion + 1;
}
