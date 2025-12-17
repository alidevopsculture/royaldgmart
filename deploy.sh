#!/bin/bash

# RDGM Website Deployment Script for New EC2 Instance
# Run this script on your new EC2 instance

set -e

echo "🚀 Starting RDGM Website Deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git and Node.js
sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone repository
git clone https://github.com/HalloTech/rdgm-version-3.git
cd rdgm-version-3

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rdgm
JWT_SECRET=your-jwt-secret-key-here
EMAIL_USER=royaldigitalmart@gmail.com
EMAIL_PASS=uwas xofi hqmk hdvr
ADMIN_EMAIL=royaldigitalmart@gmail.com
ADMIN_PASSWORD=admin123
EOF

# Frontend .env.production
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_DOMAIN=localhost:3000
EOF

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/rdgm << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /home/ubuntu/rdgm-version-3/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/rdgm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Create uploads directory
mkdir -p uploads/payment-screenshots

# Build and start containers
echo "🐳 Building and starting Docker containers..."
newgrp docker << EONG
docker-compose up --build -d
EONG

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Initialize admin user
echo "👤 Setting up admin user..."
node reset-admin-password.js

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your website is now available at:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "   Admin: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/admin"
echo ""
echo "🔑 Admin credentials:"
echo "   Email: royaldigitalmart@gmail.com"
echo "   Password: admin123"
echo ""
echo "📝 Next steps:"
echo "   1. Update your domain DNS to point to this server"
echo "   2. Configure SSL certificate (Let's Encrypt recommended)"
echo "   3. Update environment variables for production"
