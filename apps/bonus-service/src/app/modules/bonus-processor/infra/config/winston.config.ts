import { LoggerFactoryOverrides, makeWinstonOptions } from 'libs/observability/src/lib/config/winston-config.factory';

const bonusProcessorLoggerFactoryOverrides: LoggerFactoryOverrides = {
    serviceName: "bonus-processor",
    production: true
};
export const bonusProcessorWinstonConfig = makeWinstonOptions(bonusProcessorLoggerFactoryOverrides);
