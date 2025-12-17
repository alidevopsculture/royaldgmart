FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Set production environment
ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run","dev"]
