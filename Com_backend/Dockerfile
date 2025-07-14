# Use the Node.js 24 Alpine image as the base image
FROM --platform=linux/amd64 node:24-alpine

# Set the working directory in the container
WORKDIR /app

# Install GCC
RUN apk update && apk add --no-cache g++

# cpy package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
EXPOSE 5000

# Start the application
CMD [ "node", "index.js" ]