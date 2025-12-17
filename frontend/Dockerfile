FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install sharp for production image optimization
RUN npm install sharp

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
