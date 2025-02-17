#!/usr/bin/env node

const opentelemetry = require('@opentelemetry/api');
const http = require('http');
const app = require('../app');

// Normalize and set port
const port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') throw error;

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
        default:
            throw error;
    }
}

// ✅ Manual Instrumentation: Capture listening event in a trace
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    console.log('Listening on ' + bind);

    // ✅ Get tracer instance from OpenTelemetry API
    const tracer = opentelemetry.trace.getTracer('pacman-tracer');

    // ✅ Start a span to manually trace the port binding process
    const span = tracer.startSpan('server_start', {
        kind: opentelemetry.SpanKind.INTERNAL
    });

    span.setAttribute('username', 'jorge');  // Add attributes for filtering in Splunk
    span.addEvent('Server started and listening');  // Add event for visibility
    span.setAttribute('port', bind);
    
    // ✅ End span after capturing relevant info
    span.end();
}