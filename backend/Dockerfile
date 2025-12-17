FROM node:18-alpine

WORKDIR /app

# Install build tools and AWS CLI
RUN apk add --no-cache aws-cli curl python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Rebuild bcrypt for container architecture
RUN npm rebuild bcrypt --build-from-source

# Copy application code
COPY . .

# Set production environment
ENV NODE_ENV=development
ENV PORT=5000

EXPOSE 5000

CMD ["npm","start"]
