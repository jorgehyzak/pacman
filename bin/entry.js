const { start } = require('@splunk/otel');

start({
    serviceName: process.env.OTEL_SERVICE_NAME
});

// ✅ Start the application server
require('./server');
