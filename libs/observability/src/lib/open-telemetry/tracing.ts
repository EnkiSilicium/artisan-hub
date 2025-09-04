import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  BatchSpanProcessor,

} from '@opentelemetry/sdk-trace-base';

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs';

//note "gRPC" in the package name
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';


const otelSDK = new NodeSDK({
  serviceName: 'artisan-hub',
  metricReader: new PrometheusExporter({
    port: 9464,
    endpoint: '/metrics',
  }),
  spanProcessors: [
    //output traces into the console
    //new SimpleSpanProcessor(new ConsoleSpanExporter()),


    //HTTP and gRPC version have exactly the same name
    //but get exported from slightly different libs.
    //That's asinine.
    // new BatchSpanProcessor(
    //   new OTLPTraceExporter({
    //     url: 'http://otel-collector:4317',
    //   }),
    // ),
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: 'otel-collector:4317',
      }),
    ),
  ],
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new JaegerPropagator(),
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new B3Propagator(),
    ],
  }),
  instrumentations: [
    // not workin'
    //new BullMQInstrumentation(),
    new KafkaJsInstrumentation(),
    getNodeAutoInstrumentations(),
    new NestInstrumentation(),
  ],
});

export default otelSDK;
