#!/bin/bash

# Production Setup Script for FULL-MERN-AUTH-Boilerplate
# This script guides you through configuring your application for production deployment
# with interactive prompts for domain names, SSL certificates, and environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

# Function to read user input with default value
read_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$(echo -e ${CYAN}${prompt}${NC} [${GREEN}${default}${NC}]): " input
        eval "$var_name=\"\${input:-$default}\""
    else
        read -p "$(echo -e ${CYAN}${prompt}${NC}): " input
        eval "$var_name=\"\$input\""
    fi
}

# Function to confirm action
confirm_action() {
    local prompt="$1"
    local default="${2:-n}"
    
    if [ "$default" = "y" ]; then
        read -p "$(echo -e ${CYAN}${prompt}${NC} [${GREEN}Y/n${NC}]): " input
        [[ "$input" =~ ^[Nn]$ ]] && return 1 || return 0
    else
        read -p "$(echo -e ${CYAN}${prompt}${NC} [${GREEN}y/N${NC}]): " input
        [[ "$input" =~ ^[Yy]$ ]] && return 0 || return 1
    fi
}

# Function to validate domain
validate_domain() {
    local domain="$1"
    if [[ ! "$domain" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        print_error "Invalid domain format: $domain"
        return 1
    fi
    return 0
}

# Function to validate email
validate_email() {
    local email="$1"
    if [[ ! "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        print_error "Invalid email format: $email"
        return 1
    fi
    return 0
}

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Main setup function
main() {
    clear
    print_header "FULL-MERN-AUTH-Boilerplate Production Setup"
    
    print_info "This script will guide you through configuring your application"
    print_info "for production deployment with nginx, SSL certificates, and Docker."
    echo ""
    
    # Check prerequisites
    print_step "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    if ! command_exists openssl; then
        print_error "OpenSSL is not installed. Please install OpenSSL first."
        exit 1
    fi
    print_success "OpenSSL is installed"
    
    # Domain Configuration
    print_step "Domain Configuration"
    echo ""
    
    while true; do
        read_input "Enter your main domain (e.g., example.com)" "" "MAIN_DOMAIN"
        if validate_domain "$MAIN_DOMAIN"; then
            break
        fi
    done
    
    while true; do
        read_input "Enter your frontend domain (e.g., www.example.com)" "www.$MAIN_DOMAIN" "FRONTEND_DOMAIN"
        if validate_domain "$FRONTEND_DOMAIN"; then
            break
        fi
    done
    
    while true; do
        read_input "Enter your backend API domain (e.g., api.example.com)" "api.$MAIN_DOMAIN" "BACKEND_DOMAIN"
        if validate_domain "$BACKEND_DOMAIN"; then
            break
        fi
    done
    
    # Email Configuration
    print_step "Email Configuration"
    echo ""
    
    while true; do
        read_input "Enter your email for SSL certificates" "" "EMAIL"
        if validate_email "$EMAIL"; then
            break
        fi
    done
    
    # SSL Configuration
    print_step "SSL Certificate Configuration"
    echo ""
    
    print_info "Choose SSL certificate type:"
    echo "  1) Let's Encrypt (Recommended for production)"
    echo "  2) Self-Signed (For development/testing only)"
    echo ""
    
    while true; do
        read -p "$(echo -e ${CYAN}Enter your choice [1-2]${NC}): " SSL_CHOICE
        case $SSL_CHOICE in
            1)
                SSL_TYPE="letsencrypt"
                print_success "Selected: Let's Encrypt"
                break
                ;;
            2)
                SSL_TYPE="self-signed"
                print_warning "Selected: Self-Signed (NOT for production use)"
                break
                ;;
            *)
                print_error "Invalid choice. Please enter 1 or 2."
                ;;
        esac
    done
    
    # MongoDB Configuration
    print_step "MongoDB Configuration"
    echo ""
    
    read_input "MongoDB username" "admin" "MONGO_USERNAME"
    read_input "MongoDB password" "changeme" "MONGO_PASSWORD"
    
    # Application Configuration
    print_step "Application Configuration"
    echo ""
    
    read_input "Application name" "FULL-MERN-AUTH-Boilerplate" "APP_NAME"
    
    # Port Configuration
    print_step "Port Configuration"
    echo ""
    
    read_input "Nginx HTTP port" "80" "NGINX_HTTP_PORT"
    read_input "Nginx HTTPS port" "443" "NGINX_HTTPS_PORT"
    
    # Summary
    print_header "Configuration Summary"
    echo ""
    echo -e "${CYAN}Domain Configuration:${NC}"
    echo "  Main Domain:        ${GREEN}$MAIN_DOMAIN${NC}"
    echo "  Frontend Domain:    ${GREEN}$FRONTEND_DOMAIN${NC}"
    echo "  Backend Domain:     ${GREEN}$BACKEND_DOMAIN${NC}"
    echo ""
    echo -e "${CYAN}SSL Configuration:${NC}"
    echo "  Email:              ${GREEN}$EMAIL${NC}"
    echo "  Certificate Type:   ${GREEN}$SSL_TYPE${NC}"
    echo ""
    echo -e "${CYAN}MongoDB Configuration:${NC}"
    echo "  Username:           ${GREEN}$MONGO_USERNAME${NC}"
    echo "  Password:           ${GREEN}***${NC}"
    echo ""
    echo -e "${CYAN}Application Configuration:${NC}"
    echo "  App Name:           ${GREEN}$APP_NAME${NC}"
    echo ""
    echo -e "${CYAN}Port Configuration:${NC}"
    echo "  HTTP Port:          ${GREEN}$NGINX_HTTP_PORT${NC}"
    echo "  HTTPS Port:         ${GREEN}$NGINX_HTTPS_PORT${NC}"
    echo ""
    
    # Confirm configuration
    if ! confirm_action "Do you want to proceed with this configuration?" "n"; then
        print_warning "Setup cancelled by user."
        exit 0
    fi
    
    # Create directories
    print_step "Creating necessary directories..."
    
    mkdir -p nginx/ssl
    mkdir -p logs/nginx
    
    print_success "Directories created"
    
    # Update nginx configuration
    print_step "Updating nginx configuration..."
    
    # Backup original config
    if [ -f "nginx/nginx.conf" ]; then
        cp nginx/nginx.conf nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
        print_info "Original nginx.conf backed up"
    fi
    
    # Update server_name in nginx.conf
    if [ -f "nginx/nginx.conf" ]; then
        sed -i.tmp "s/server_name _;/server_name $MAIN_DOMAIN $FRONTEND_DOMAIN;/" nginx/nginx.conf
        rm -f nginx/nginx.conf.tmp
        print_success "Updated nginx.conf with domain names"
    fi
    
    # Update production-nginx.conf
    if [ -f "nginx/production-nginx.conf" ]; then
        sed -i.tmp "s/server_name yourdomain.com www.yourdomain.com;/server_name $MAIN_DOMAIN $FRONTEND_DOMAIN;/" nginx/production-nginx.conf
        rm -f nginx/production-nginx.conf.tmp
        print_success "Updated production-nginx.conf with domain names"
    fi
    
    # Update docker-compose.prod.yml
    print_step "Updating docker-compose configuration..."
    
    # Backup original config
    if [ -f "docker-compose.prod.yml" ]; then
        cp docker-compose.prod.yml docker-compose.prod.yml.backup.$(date +%Y%m%d_%H%M%S)
        print_info "Original docker-compose.prod.yml backed up"
    fi
    
    # Update port mappings
    if [ -f "docker-compose.prod.yml" ]; then
        sed -i.tmp "s/- '80:80'/-'$NGINX_HTTP_PORT:80'/" docker-compose.prod.yml
        sed -i.tmp "s/- '443:443'/-'$NGINX_HTTPS_PORT:443'/" docker-compose.prod.yml
        rm -f docker-compose.prod.yml.tmp
        print_success "Updated port mappings"
    fi
    
    # Create or update .env file
    print_step "Creating environment configuration..."
    
    if [ -f ".env" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        print_info "Existing .env backed up"
    fi
    
    cat > .env << EOF
# Domain Configuration
NGINX_HOST=$MAIN_DOMAIN
MAIN_DOMAIN=$MAIN_DOMAIN
FRONTEND_DOMAIN=$FRONTEND_DOMAIN
BACKEND_DOMAIN=$BACKEND_DOMAIN

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://$BACKEND_DOMAIN
NEXT_PUBLIC_APP_URL=https://$FRONTEND_DOMAIN

# Backend Configuration
CLIENT_URL=https://$FRONTEND_DOMAIN
BACKEND_URL=http://backend:5000

# MongoDB Configuration
MONGO_USERNAME=$MONGO_USERNAME
MONGO_PASSWORD=$MONGO_PASSWORD
MONGO_URI=mongodb://$MONGO_USERNAME:$MONGO_PASSWORD@mongodb:27017/authboiler?authSource=admin

# Application Configuration
NODE_ENV=production
APP_NAME=$APP_NAME

# SSL Configuration
SSL_TYPE=$SSL_TYPE
SSL_EMAIL=$EMAIL

# Port Configuration
NGINX_HTTP_PORT=$NGINX_HTTP_PORT
NGINX_HTTPS_PORT=$NGINX_HTTPS_PORT
EOF
    
    print_success "Environment configuration created"
    
    # SSL Certificate Setup
    print_step "Setting up SSL certificates..."
    
    if [ "$SSL_TYPE" = "letsencrypt" ]; then
        print_info "Starting services without nginx for SSL certificate generation..."
        docker-compose -f docker-compose.prod.yml up -d mongodb backend frontend
        
        print_info "Waiting for services to be ready..."
        sleep 15
        
        print_info "Obtaining SSL certificates from Let's Encrypt..."
        
        # Obtain certificates for main domain
        docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
            --webroot \
            --webroot-path /var/www/certbot \
            --email "$EMAIL" \
            --agree-tos \
            --no-eff-email \
            -d "$MAIN_DOMAIN" \
            -d "$FRONTEND_DOMAIN" || {
            print_warning "Failed to obtain certificates for main domain. Continuing with backend domain..."
        }
        
        # Obtain certificates for backend domain (if different)
        if [ "$BACKEND_DOMAIN" != "$MAIN_DOMAIN" ] && [ "$BACKEND_DOMAIN" != "api.$MAIN_DOMAIN" ]; then
            docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
                --webroot \
                --webroot-path /var/www/certbot \
                --email "$EMAIL" \
                --agree-tos \
                --no-eff-email \
                -d "$BACKEND_DOMAIN" || {
                print_warning "Failed to obtain certificates for backend domain."
            }
        fi
        
        # Copy certificates to ssl directory
        print_info "Copying certificates to ssl directory..."
        
        if docker cp authboiler-certbot-prod:/etc/letsencrypt/live/$MAIN_DOMAIN/fullchain.pem nginx/ssl/ 2>/dev/null; then
            docker cp authboiler-certbot-prod:/etc/letsencrypt/live/$MAIN_DOMAIN/privkey.pem nginx/ssl/
            docker cp authboiler-certbot-prod:/etc/letsencrypt/live/$MAIN_DOMAIN/chain.pem nginx/ssl/
            
            # Set proper permissions
            chmod 644 nginx/ssl/*.pem
            
            print_success "SSL certificates obtained and copied successfully"
        else
            print_warning "Failed to copy certificates. You may need to obtain them manually."
        fi
        
    elif [ "$SSL_TYPE" = "self-signed" ]; then
        print_warning "Generating self-signed certificates (DEVELOPMENT ONLY)..."
        print_warning "Do NOT use self-signed certificates in production!"
        
        # Generate self-signed certificate for main domain
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/privkey.pem \
            -out nginx/ssl/fullchain.pem \
            -subj "/C=US/ST=State/L=City/O=$APP_NAME/CN=$MAIN_DOMAIN" || {
            print_error "Failed to generate self-signed certificate"
            exit 1
        }
        
        # Create chain.pem (copy of fullchain.pem for self-signed)
        cp nginx/ssl/fullchain.pem nginx/ssl/chain.pem
        
        # Set proper permissions
        chmod 644 nginx/ssl/*.pem
        
        print_success "Self-signed certificates generated"
    fi
    
    # Start all services
    print_step "Starting all services..."
    
    docker-compose -f docker-compose.prod.yml up -d
    
    print_info "Waiting for services to start..."
    sleep 10
    
    # Check service status
    print_step "Checking service status..."
    
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Services are running"
    else
        print_warning "Some services may not be running correctly. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    fi
    
    # Final summary
    print_header "Setup Complete!"
    echo ""
    print_success "Your application has been configured for production deployment!"
    echo ""
    echo -e "${CYAN}Access your application:${NC}"
    echo "  Frontend:    ${GREEN}https://$FRONTEND_DOMAIN${NC}"
    echo "  Backend:     ${GREEN}https://$BACKEND_DOMAIN${NC}"
    echo "  Health:      ${GREEN}https://$FRONTEND_DOMAIN/health${NC}"
    echo ""
    echo -e "${CYAN}Useful commands:${NC}"
    echo "  View logs:      ${GREEN}docker-compose -f docker-compose.prod.yml logs -f${NC}"
    echo "  Stop services:  ${GREEN}docker-compose -f docker-compose.prod.yml down${NC}"
    echo "  Restart nginx:  ${GREEN}docker-compose -f docker-compose.prod.yml restart nginx${NC}"
    echo "  Check status:   ${GREEN}docker-compose -f docker-compose.prod.yml ps${NC}"
    echo ""
    echo -e "${CYAN}Important notes:${NC}"
    if [ "$SSL_TYPE" = "self-signed" ]; then
        print_warning "You are using self-signed certificates. Browsers will show security warnings."
        print_warning "Do NOT use self-signed certificates in production!"
    fi
    print_info "Make sure your DNS records point to this server."
    print_info "For SSL certificate renewal, certbot will automatically renew every 12 hours."
    echo ""
    print_success "Setup completed successfully!"
    echo ""
}

# Run main function
main
