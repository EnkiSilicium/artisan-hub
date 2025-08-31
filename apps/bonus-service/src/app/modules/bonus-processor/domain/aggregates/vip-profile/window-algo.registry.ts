import { thirtyDaysInMinutes, thirtyDaysInSeconds } from 'shared-kernel';

export abstract class WindowAlgoRegistryInterface {
  readonly policyName: 'WindowAlgoRegistry';

  readonly periodSecondsLength: number;
  readonly amountOfBuckets: number;
  readonly version: number;
}

//No need to store all of those in the code, only the latest - there will be no "replay"
/**
 * Parameters of the window algorithm implemented in VipProfile
 */
export const WindowAlgoRegistry: WindowAlgoRegistryInterface = {
  policyName: 'WindowAlgoRegistry',
  amountOfBuckets: thirtyDaysInMinutes,
  periodSecondsLength: thirtyDaysInSeconds,
  version: 1,
};
