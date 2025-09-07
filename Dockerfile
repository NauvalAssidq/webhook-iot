# Filename: Dockerfile

# Start from an official, lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
# This is done first to take advantage of Docker's layer caching.
# If these files don't change, Docker won't need to reinstall dependencies on every build.
COPY package*.json ./

# Install the application's dependencies
RUN npm install --omit=dev

# Copy the rest of your application's source code (app.js, routes folder, etc.)
COPY . .

# Expose the port that the application runs on (from our app.js file)
EXPOSE 3000

# Define the command to start the application when the container launches
CMD [ "node", "app.js" ]