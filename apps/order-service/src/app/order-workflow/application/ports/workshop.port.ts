export abstract class WorkshopPort {
  abstract checkWorkshopExistsMany(workshopIds: string[]): Promise<boolean>;
}
