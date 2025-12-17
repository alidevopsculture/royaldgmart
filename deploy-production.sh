#!/bin/bash

# Royal Digital Mart - Production Deployment Script
# Run this script on your AWS EC2 instance

set -e

echo "🚀 Starting Royal Digital Mart Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Create logs directories
print_status "Creating log directories..."
mkdir -p backend/logs frontend/logs

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install --production
cd ..

# Install frontend dependencies and build
print_status "Installing frontend dependencies and building..."
cd frontend
npm install
npm run build
cd ..

# Setup Nginx configuration
print_status "Setting up Nginx configuration..."
sudo cp nginx-domain.conf /etc/nginx/sites-available/royaldgmart
sudo ln -sf /etc/nginx/sites-available/royaldgmart /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services with PM2
print_status "Starting backend with PM2..."
cd backend
pm2 start ecosystem.config.js
cd ..

print_status "Starting frontend with PM2..."
cd frontend
pm2 start ecosystem.config.js
cd ..

# Save PM2 configuration
pm2 save
pm2 startup

# Start Nginx
print_status "Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup SSL Certificate
print_status "Setting up SSL certificate..."
print_warning "Please run the following command manually after deployment:"
echo "sudo certbot --nginx -d royaldgmart.com -d www.royaldgmart.com"

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8080
sudo ufw --force enable

print_status "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your website will be available at:"
echo "   - Temporary: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "   - Production: https://www.royaldgmart.com (after SSL setup)"
echo ""
echo "🔧 Next steps:"
echo "1. Point your domain DNS to this server's IP"
echo "2. Run: sudo certbot --nginx -d royaldgmart.com -d www.royaldgmart.com"
echo "3. Update nginx config to enable SSL (uncomment SSL lines)"
echo "4. Test your website"
echo ""
echo "📊 Useful commands:"
echo "   - Check PM2 status: pm2 status"
echo "   - View logs: pm2 logs"
echo "   - Restart services: pm2 restart all"
echo "   - Check Nginx: sudo nginx -t && sudo systemctl status nginx"