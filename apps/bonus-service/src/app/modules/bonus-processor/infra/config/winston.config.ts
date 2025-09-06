import { makeWinstonOptions } from 'observability';

import type { LoggerFactoryOverrides } from 'observability';

const bonusProcessorLoggerFactoryOverrides: LoggerFactoryOverrides = {
  serviceName: 'bonus-processor',
  production: true,
};
export const bonusProcessorWinstonConfig = makeWinstonOptions(
  bonusProcessorLoggerFactoryOverrides,
);
