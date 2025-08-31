import { OpenTelemetryModuleOptions } from 'nestjs-otel';


export type OtelFactoryOverrides = {
    serviceName?: string;
    enableApiMetrics?: boolean;
    metricsPrefix?: string;
};

export function makeOtelOptions(
    overrides: OtelFactoryOverrides = {}
): OpenTelemetryModuleOptions {
    const serviceName = overrides.serviceName ?? 'order-service';
    const enableApiMetrics = overrides.enableApiMetrics ?? true;
    const prefix = overrides.metricsPrefix ?? 'metrics';

    return {
        metrics: {
            apiMetrics: {
                enable: enableApiMetrics,
                defaultAttributes: { service: serviceName },
                ignoreUndefinedRoutes: false,
                prefix,
            },
        },
    };
}
