# Use a standard Node.js image for development
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker's cache
COPY package*.json ./

# Install all dependencies, including dev dependencies like nodemon
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Expose the port your Express app runs on
EXPOSE 8080

# The command to start the app using nodemon for hot reloading
CMD [ "npm", "run", "dev" ]