# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of the code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]
