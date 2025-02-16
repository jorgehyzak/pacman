const { start } = require('@splunk/otel');

start({
   serviceName: 'pacman'
}).then(() => {
    console.log("✅ OpenTelemetry instrumentation started");
    require('./server');  // Ensure server.js starts AFTER OpenTelemetry
}).catch((err) => {
    console.error("❌ OpenTelemetry failed to start:", err);
});

