# Multi-stage Dockerfile for Prjctzr MCP Server
# Includes all necessary tools for project initialization

# Stage 1: Base tools image
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    docker-cli \
    docker-compose \
    make \
    python3 \
    py3-pip \
    go \
    rust \
    cargo

# Install global Node tools
RUN npm install -g \
    typescript \
    @angular/cli \
    @vue/cli \
    create-react-app \
    express-generator \
    nest \
    pm2 \
    nodemon

# Install Python tools
RUN pip3 install --no-cache-dir \
    cookiecutter \
    poetry \
    black \
    ruff \
    pytest \
    mkdocs

# Stage 2: Dagger tools
FROM base AS dagger

# Install Dagger CLI
RUN curl -L https://dl.dagger.io/dagger/install.sh | sh && \
    mv /usr/local/bin/dagger /usr/bin/dagger

# Stage 3: Application
FROM dagger AS app

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directories for templates and data
RUN mkdir -p /app/templates /app/data /workspace

# Set environment variables
ENV NODE_ENV=production
ENV PRJCTZR_HOME=/app
ENV PRJCTZR_TEMPLATES=/app/templates
ENV PRJCTZR_DATA=/app/data

# Volume for workspace (where projects will be created)
VOLUME ["/workspace"]

# Volume for persistent data
VOLUME ["/app/data"]

# Volume for custom templates
VOLUME ["/app/templates"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Default command (can be overridden)
CMD ["node", "index.js"]

# Labels
LABEL maintainer="Prjctzr Team"
LABEL version="2.0.0"
LABEL description="Intelligent project initialization MCP server"
