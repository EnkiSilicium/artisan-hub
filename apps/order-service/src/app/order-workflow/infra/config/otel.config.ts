import { OtelFactoryOverrides, makeOtelOptions } from 'libs/observability/src/lib/config/otel-config.factory';


export const orderOtelFactoryOverrides: OtelFactoryOverrides = {
    serviceName: "order-workflow"
};
export const orderWorkflowOtelConfig = makeOtelOptions(orderOtelFactoryOverrides);
