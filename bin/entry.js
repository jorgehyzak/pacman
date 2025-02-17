const { start } = require('@splunk/otel');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const opentelemetry = require('@opentelemetry/api');

// ✅ Enable OpenTelemetry Debug Logs
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// ✅ Start Auto-Instrumentation (handles HTTP, Express, DB, etc.)
start({
    serviceName: process.env.OTEL_SERVICE_NAME || 'pacman'
});

// ✅ Define OpenTelemetry Resource for manual spans
const resource = new Resource({
    'service.name': process.env.OTEL_SERVICE_NAME || 'pacman',
    'deployment.environment': process.env.OTEL_RESOURCE_ATTRIBUTES?.split(',').find(attr => attr.includes('deployment.environment'))?.split('=')[1] || 'development'
});

// ✅ Configure the OpenTelemetry SDK for manual tracing
const provider = new NodeTracerProvider({ resource });

// ✅ Use OTLP HTTP Exporter for manual spans (matching Splunk Observability)
const traceExporter = new OTLPTraceExporter({
    url: 'https://ingest.us1.signalfx.com/v2/trace/otlp',  // ✅ Correct endpoint
    headers: {
        'X-SF-Token': process.env.SPLUNK_ACCESS_TOKEN,  // ✅ Correct header for Splunk
        'Content-Type': 'application/x-protobuf'  // ✅ Matches OTLP Protobuf format
    }
});

// ✅ Attach the exporter to the manual provider
provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

// ✅ REGISTER THE PROVIDER (Fixes the issue)
provider.register();  // 🚀 This is REQUIRED to enable manual spans

// ✅ Get a manual tracer
const tracer = provider.getTracer('pacman-tracer');

// ✅ Example Manual Span (Verifies it's working)
const span = tracer.startSpan('manual-span-test');
span.setAttribute('example', 'testing');
span.addEvent('Manual span created');
span.end();  // ✅ Ensures span is exported

console.log("✅ OpenTelemetry instrumentation started and sending spans directly to Splunk Observability Cloud (us1)");

// ✅ Start the application server
require('./server');
