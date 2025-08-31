import { OtelFactoryOverrides, makeOtelOptions } from 'libs/observability/src/lib/config/otel-config.factory';


export const bonusProcessorOtelFactoryOverrides: OtelFactoryOverrides = {
    serviceName: "bonus-processor"
};
export const bonusProcessorOtelConfig = makeOtelOptions(bonusProcessorOtelFactoryOverrides);
