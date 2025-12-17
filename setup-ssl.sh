#!/bin/bash

# SSL Setup Script for Royal Digital Mart
# Run this after your domain is pointing to the server

set -e

echo "🔒 Setting up SSL for Royal Digital Mart..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if domain is pointing to this server
print_status "Checking domain configuration..."
DOMAIN_IP=$(dig +short www.royaldgmart.com)
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    print_warning "Domain might not be pointing to this server yet."
    print_warning "Domain IP: $DOMAIN_IP"
    print_warning "Server IP: $SERVER_IP"
    echo "Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Obtain SSL certificate
print_status "Obtaining SSL certificate..."
sudo certbot --nginx -d royaldgmart.com -d www.royaldgmart.com --non-interactive --agree-tos --email royaldigitalmart@gmail.com

# Update Nginx configuration to enable SSL
print_status "Updating Nginx configuration..."
sudo sed -i 's/# ssl_certificate/ssl_certificate/g' /etc/nginx/sites-available/royaldgmart
sudo sed -i 's/# ssl_certificate_key/ssl_certificate_key/g' /etc/nginx/sites-available/royaldgmart

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# Setup auto-renewal
print_status "Setting up SSL auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

print_status "✅ SSL setup completed!"
echo ""
echo "🌐 Your website is now available at:"
echo "   - https://www.royaldgmart.com"
echo "   - https://royaldgmart.com"
echo ""
echo "🔒 SSL certificate will auto-renew every 60 days"