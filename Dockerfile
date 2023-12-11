# Stage 1: Building the application
FROM node:16-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only the production dependencies
RUN npm install --only=production

# Copy the rest of your app's source code
COPY . .

# Stage 2: Setting up the production environment
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]