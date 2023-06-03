FROM node:19

MAINTAINER Ivan Font <ifont@redhat.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Clone game source code
RUN git clone https://github.com/jorgehyzak/pacman.git .

# Install app dependencies
RUN npm install @splunk/otel
RUN npm install

# Expose port 8080
EXPOSE 8080

# Run container
# CMD ["npm", "start"]
# CMD ["node", "-r", "@splunk/otel/instrument", "./bin/server.js"]
CMD ["npm", "start", "./bin/server.js"]
