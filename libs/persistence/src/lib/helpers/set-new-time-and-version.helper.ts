import { EntityTechnicalsInterface } from "libs/persistence/src/lib/interfaces/entity-techncials.interface";
import { isoNow } from "shared-kernel";

/**
 * Repo helper - updates version to [newVersion] and lastUpdatedAt to [now].
 * Optionally, sets the createdAt to [now] as well.
 *
 * @param newVersion
 * @param target
 * @param setCreatedAt
 */
export function setNewTimeAndVersion(
  newVersion: number,
  target: EntityTechnicalsInterface,
  setCreatedAt: boolean = false,
  now: string = isoNow(),
): void {
  target.version = newVersion;
  target.lastUpdatedAt = now;
  if (setCreatedAt) target.createdAt = now;
}
