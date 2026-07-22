import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger:4318/v1/traces';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: otlpEndpoint }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log(`OpenTelemetry tracing initialized with OTLP exporter at ${otlpEndpoint}.`);

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});