const { start } = require('@splunk/otel');

// Start OpenTelemetry
start({
   serviceName: 'pacman'
});

// Log confirmation message
console.log("✅ OpenTelemetry instrumentation started");

// Start the application server
require('./server');
