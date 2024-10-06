# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Copy all project files
COPY . .

# Install app dependencies
RUN npm install

# Build the application
RUN npm run build

# Copy the env file
COPY .env ./

# Expose the port the app runs on
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]