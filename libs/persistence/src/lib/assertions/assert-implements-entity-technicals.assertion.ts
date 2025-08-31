import { EntityTechnicalsInterface } from "libs/persistence/src/lib/interfaces/entity-techncials.interface";

export function assertImplementsEntityTechnicals(
  entity: any,
): asserts entity is EntityTechnicalsInterface {
  const versionDefined = typeof entity?.version === 'number';
  const createdAtDefined = typeof entity?.createdAt === 'string';
  const lastUpdatedAtDefined = typeof entity?.lastUpdatedAt === 'string';

  if (!(versionDefined && createdAtDefined && lastUpdatedAtDefined)) {
    throw new Error('Entity does have required version or time fields');
  }
}
