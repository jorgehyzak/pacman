const { start } = require('@splunk/otel');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-node');
const opentelemetry = require('@opentelemetry/api');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Enable OpenTelemetry Debug Logs
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Initialize OpenTelemetry Tracer
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())); // Export to Console
provider.register();

const tracer = opentelemetry.trace.getTracer('pacman-tracer');

// Start OpenTelemetry Auto-Instrumentation
start({
    serviceName: 'pacman'
});

console.log("✅ OpenTelemetry instrumentation started");

// Start the application server after OpenTelemetry is initialized
require('./server');
