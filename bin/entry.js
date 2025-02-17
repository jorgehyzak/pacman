const { start } = require('@splunk/otel');
const opentelemetry = require('@opentelemetry/api');

start({
    serviceName: process.env.OTEL_SERVICE_NAME || "pacman-service"
});

// Export tracer for use in other files
const tracer = opentelemetry.trace.getTracer("pacman-tracer");

module.exports = tracer; // Export the tracer for use in other files

// ✅ Start the application server
require('./server');


