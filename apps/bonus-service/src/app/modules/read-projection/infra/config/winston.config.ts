import { makeWinstonOptions } from 'observability';

import type { LoggerFactoryOverrides } from 'observability';

const bonusReadLoggerFactoryOverrides: LoggerFactoryOverrides = {
  serviceName: 'bonus-read',
  production: true,
};
export const bonusReadWinstonConfig = makeWinstonOptions(
  bonusReadLoggerFactoryOverrides,
);
