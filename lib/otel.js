const { NodeSDK } = require('@opentelemetry/sdk-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

function setupOpenTelemetry(serviceName) {
    const sdk = new NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
            [SemanticResourceAttributes.SERVICE_VERSION]: process.env.OTEL_RESOURCE_ATTRIBUTES?.match(/service.version=([^,]*)/)?.[1] || "unknown",
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.OTEL_RESOURCE_ATTRIBUTES?.match(/deployment.environment=([^,]*)/)?.[1] || "unknown",
        }),
        traceExporter: new OTLPTraceExporter({
            url: "http://192.168.1.37:4318/v1/traces", // Local Splunk OpenTelemetry Collector
        }),
        instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
    console.log(`OpenTelemetry started for service: ${serviceName}, sending traces to http://192.168.1.37:4318/v1/traces`);
    return sdk;
}

module.exports = setupOpenTelemetry;
