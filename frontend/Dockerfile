FROM node:18

# Set work directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json /

RUN npm cache clean --force
RUN npm install --unsafe-perm

# Copy project
COPY . .

# Expose port
EXPOSE 8080

# Run server
CMD ["npm", "start"]