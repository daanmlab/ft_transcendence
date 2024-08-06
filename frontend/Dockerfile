# frontend/Dockerfile
FROM node:14

# Set work directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install

# Copy project
COPY . /usr/src/app/

# Expose port
EXPOSE 8080

# Run server
CMD ["npm", "start"]