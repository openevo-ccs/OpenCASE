# Development Dockerfile for the CASE Editor
# Runs Vite dev server with hot-reload support

FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./

RUN npm install

# Copy source files (will be overridden by volume mounts in dev)
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server
# --host 0.0.0.0 allows access from outside container
# --strictPort ensures it fails if port is unavailable
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--strictPort"]
