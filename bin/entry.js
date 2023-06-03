#!/usr/bin/env node
const { start } = require('@splunk/otel');

start({
   serviceName: 'pacman'
});
