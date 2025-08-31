import { LoggerFactoryOverrides, makeWinstonOptions } from 'libs/observability/src/lib/config/winston-config.factory';

const orderLoggerFactoryOverrides: LoggerFactoryOverrides = {
    serviceName: "order-workflow",
};
export const orderWorkflowWinstonConfig = makeWinstonOptions(orderLoggerFactoryOverrides);
