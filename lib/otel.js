const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

function setupOpenTelemetry(serviceName) {
    const sdk = new NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
            [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0"
        }),
        traceExporter: new ConsoleSpanExporter(), // Replace with Splunk exporter if needed
        instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
    console.log(`OpenTelemetry started for service: ${serviceName}`);
    return sdk;
}

module.exports = setupOpenTelemetry;
