import { LoggerFactoryOverrides, makeWinstonOptions } from 'libs/observability/src/lib/config/winston-config.factory';

const bonusReadLoggerFactoryOverrides: LoggerFactoryOverrides = {
    serviceName: "bonus-read",
    production: true
};
export const bonusReadWinstonConfig = makeWinstonOptions(bonusReadLoggerFactoryOverrides);
