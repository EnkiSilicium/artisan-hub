import { OtelFactoryOverrides, makeOtelOptions } from 'libs/observability/src/lib/config/otel-config.factory';


export const bonusReadOtelFactoryOverrides: OtelFactoryOverrides = {
    serviceName: "bonus-read"
};
export const bonusReadOtelConfig = makeOtelOptions(bonusReadOtelFactoryOverrides);
