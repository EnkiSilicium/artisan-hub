import { makeWinstonOptions } from 'observability';

import type { LoggerFactoryOverrides } from 'observability';

const orderLoggerFactoryOverrides: LoggerFactoryOverrides = {
  serviceName: 'order-read',
};
export const orderReadWinstonConfig = makeWinstonOptions(
  orderLoggerFactoryOverrides,
);
