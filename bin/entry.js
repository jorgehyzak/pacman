const { start } = require('@splunk/otel');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const opentelemetry = require('@opentelemetry/api');

// Enable OpenTelemetry Debug Logs
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// ✅ Start Auto-Instrumentation First
start({
    serviceName: process.env.OTEL_SERVICE_NAME || 'pacman'
});

// ✅ Define OpenTelemetry Resource
const resource = new Resource({
    'service.name': process.env.OTEL_SERVICE_NAME || 'pacman',
    'deployment.environment': process.env.OTEL_RESOURCE_ATTRIBUTES?.split(',').find(attr => attr.includes('deployment.environment'))?.split('=')[1] || 'development'
});

// ✅ Configure the OpenTelemetry SDK for manual tracing (sending directly to Splunk)
const provider = new NodeTracerProvider({ resource });

// ✅ Use OTLP HTTP Exporter with **correct Splunk endpoint and headers**
const traceExporter = new OTLPTraceExporter({
    url: 'https://ingest.us1.signalfx.com/v2/trace/otlp',  // ✅ Correct endpoint
    headers: {
        'X-SF-Token': process.env.SPLUNK_ACCESS_TOKEN,  // ✅ Correct header for Splunk
        'Content-Type': 'application/x-protobuf'  // ✅ Required for OTLP protobuf format
    }
});

// ✅ Add the exporter **without** calling `provider.register()`
provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

console.log("✅ OpenTelemetry instrumentation started and sending spans directly to Splunk Observability Cloud (us1)");

// Start the application server after OpenTelemetry is initialized
require('./server');
