FROM node:19

MAINTAINER Ivan Font <ifont@redhat.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Clone game source code
RUN git clone --branch datadog-instrumentation https://github.com/jorgehyzak/pacman.git .

# Install app dependencies
#RUN npm install @opentelemetry/api
#RUN npm install @splunk/otel
#RUN npm install @opentelemetry/sdk-node
#RUN npm install @opentelemetry/auto-instrumentations-node
#RUN npm install express
RUN npm install dd-trace --save
RUN npm install

# Expose port 8080
EXPOSE 8080

# Run container
CMD ["npm", "start"]
# CMD ["node", "-r", "@splunk/otel/instrument", "./bin/server.js"]
# CMD ["npm", "start", "./bin/server.js"]
# CMD ["node", "-r", "./bin/entry.js", "./bin/server.js"]
