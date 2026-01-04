# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directories for uploads and reports
RUN mkdir -p data/Uploads data/Reports

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/v1/user', (r) => process.exit(r.statusCode === 200 || r.statusCode === 404 ? 0 : 1))" || exit 1

# Start the application
CMD ["npm", "start"]
