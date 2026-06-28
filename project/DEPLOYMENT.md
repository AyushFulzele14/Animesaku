# ANIMYSAKU STORE - Complete Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Email Service Setup](#email-service-setup)
6. [Payment Gateway Setup](#payment-gateway-setup)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+
- Git

### Backend Setup

```bash
cd backend
npm install

# Create .env file from .env.example
cp .env.example .env

# Update .env with local values
# MongoDB: mongodb://localhost:27017/animysaku
# Redis: redis://localhost:6379

# Start MongoDB
mongod

# Start Redis
redis-server

# Run in development mode
npm run dev

# Or for clean mode (kills port 5000 first)
npm run dev:clean
```

### Frontend Setup

```bash
npm install
npm run dev
# Visit http://localhost:5173
```

---

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# 1. Create .env file with production values
cp .env.example .env
# Edit .env with production credentials

# 2. Build and start all services
docker-compose up -d

# 3. Verify services
docker-compose ps

# 4. View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# 5. Stop services
docker-compose down
```

### Option 2: Manual Deployment

#### On Server:
```bash
# 1. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb redis-server nginx

# 2. Clone repository
git clone <your-repo-url>
cd animysaku-store

# 3. Setup backend
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values

# 4. Setup frontend
cd ..
npm install
npm run build

# 5. Setup systemd service for backend
sudo nano /etc/systemd/system/animysaku-backend.service
```

Add this to systemd service file:
```ini
[Unit]
Description=Animysaku Backend API
After=network.target

[Service]
User=www-data
WorkingDirectory=/home/ubuntu/animysaku-store/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 6. Start backend service
sudo systemctl enable animysaku-backend
sudo systemctl start animysaku-backend

# 7. Configure nginx as reverse proxy
sudo nano /etc/nginx/sites-available/animysaku
```

Add this nginx config:
```nginx
upstream backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;

  # SSL certificates (use Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Frontend
  location / {
    root /home/ubuntu/animysaku-store/dist;
    try_files $uri $uri/ /index.html;
  }

  # Backend API
  location /api/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```bash
# 8. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# 9. Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Option 3: Cloud Platforms

#### Vercel (Frontend Only)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel dashboard
# VITE_API_URL = your-backend-url
```

#### Railway / Render (Full Stack)
- Connect GitHub repository
- Set environment variables
- Enable auto-deploy

#### AWS / Azure / Google Cloud
- Use container orchestration (ECS, AKS, GKE)
- Set up managed databases (Atlas MongoDB, Azure Cosmos)
- Use CDN for frontend distribution

---

## Environment Configuration

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/animysaku

# JWT
JWT_SECRET=generate-random-strong-key-here
JWT_EXPIRY=7d

# Email Service
SMTP_SERVICE=gmail
SMTP_EMAIL=noreply@yourdomain.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=AnimySaku <noreply@yourdomain.com>

# Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Image Upload
CLOUDINARY_NAME=your-name
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Cache
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/animysaku/app.log
```

### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_ENABLE_RAZORPAY=true
```

---

## Database Setup

### MongoDB Atlas Cloud

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
6. Add to `.env` as `MONGODB_URI`

### Local MongoDB

```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start service
mongod

# Verify
mongo --version
```

### Database Seeding

```bash
cd backend
npm run seed

# This will populate initial products
```

---

## Email Service Setup

### Gmail SMTP (Recommended for Testing)

1. Go to https://myaccount.google.com/apppasswords
2. Generate app-specific password
3. Use credentials in `.env`:
   ```
   SMTP_SERVICE=gmail
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=app-password-here
   ```

### SendGrid

1. Sign up at https://sendgrid.com
2. Create API key
3. Update `.env`:
   ```
   SMTP_SERVICE=SendGrid
   SMTP_EMAIL=apikey@sendgrid.net
   SMTP_PASSWORD=SG.your-api-key
   ```

### AWS SES

1. Verify email in AWS SES console
2. Create SMTP credentials
3. Update `.env` with SMTP credentials

---

## Payment Gateway Setup

### Razorpay

1. Sign up at https://razorpay.com
2. Get API keys from dashboard
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx (test)
   RAZORPAY_KEY_SECRET=xxxxx
   ```

4. For production, switch to live keys:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=live-key
   ```

5. Setup webhook (optional):
   - Go to Razorpay Dashboard > Webhooks
   - Add: `https://yourdomain.com/api/razorpay/webhook`
   - Subscribe to: `payment.authorized`, `payment.failed`, etc.

---

## Monitoring & Troubleshooting

### Backend Health Check

```bash
curl http://localhost:5000/api/health

# Expected response:
# { "status": "ok", "timestamp": "2026-06-12T10:00:00Z" }
```

### View Logs

```bash
# Systemd service
journalctl -u animysaku-backend -f

# Docker containers
docker-compose logs -f backend
docker-compose logs -f frontend

# Application logs
tail -f /var/log/animysaku/app.log
```

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check MongoDB is running
ps aux | grep mongod

# Verify connection string in .env
# Test connection:
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/test"
```

#### 2. Email Not Sending
- Verify SMTP credentials
- Check "Less secure apps" is enabled (Gmail)
- Verify sender email is whitelisted (SES)
- Check spam folder
- Enable logging: `LOG_LEVEL=debug`

#### 3. Payment Not Working
- Verify API keys are live (not test) in production
- Check CORS allows Razorpay domain
- Verify webhook endpoint is accessible
- Check amount is in correct format (paise for Razorpay)

#### 4. Stock Not Updating
- Verify MongoDB stock field exists
- Check order creation payload includes quantities
- Verify order verification endpoint is called
- Check database transaction logging

### Performance Optimization

```bash
# Enable Redis caching
# Add to .env:
REDIS_URL=redis://localhost:6379

# Setup CDN for images
# Update image URLs to CDN in AdminProductManager

# Enable Gzip compression
# Already configured in nginx.conf and backend (via compression package)

# Setup database indexes
# Run in MongoDB:
db.products.createIndex({ "category": 1, "price": 1 })
db.orders.createIndex({ "user": 1, "createdAt": -1 })
```

---

## Security Checklist

- [ ] JWT_SECRET is random and strong
- [ ] CORS_ORIGIN restricted to your domain
- [ ] HTTPS/SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Database password is strong
- [ ] API keys rotated regularly
- [ ] Sensitive logs not exposed
- [ ] Input validation implemented
- [ ] SQL/NoSQL injection protection
- [ ] CSRF tokens implemented
- [ ] Regular security updates

---

## Scaling Recommendations

As traffic increases:

1. **Database**: Use MongoDB Atlas Auto-scaling
2. **Cache**: Use Redis Cluster for horizontal scaling
3. **Images**: Use CDN (Cloudinary, AWS CloudFront)
4. **Server**: Use load balancer (Nginx, AWS ALB)
5. **Backend**: Deploy multiple instances behind load balancer
6. **Frontend**: Use static site hosting (Vercel, Netlify, CloudFront)

---

## Support & Maintenance

- **Logs**: `/var/log/animysaku/app.log`
- **Metrics**: Monitor CPU, Memory, Database connections
- **Backups**: Setup daily MongoDB backups
- **Updates**: Keep dependencies updated: `npm audit fix`

For issues, check:
1. Application logs
2. MongoDB connection
3. Redis cache status
4. Environment variables
5. Firewall/Security groups
