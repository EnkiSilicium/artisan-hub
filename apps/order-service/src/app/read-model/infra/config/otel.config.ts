import { OtelFactoryOverrides, makeOtelOptions } from 'libs/observability/src/lib/config/otel-config.factory';


const orderOtelFactoryOverrides: OtelFactoryOverrides = {
    serviceName: "order-read"
};
export const orderReadOtelConfig = makeOtelOptions(orderOtelFactoryOverrides);
