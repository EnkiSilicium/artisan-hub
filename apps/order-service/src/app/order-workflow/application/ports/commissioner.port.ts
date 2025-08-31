export abstract class CommissionerPort {
  abstract checkCommissionerExists(commissionerId: string): Promise<boolean>;
}
