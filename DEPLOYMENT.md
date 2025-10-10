# CraftLab Deployment Guide

This guide covers deployment strategies and configurations for the CraftLab Career Development Platform with enhanced features including video uploads, social networking, and admin dashboard.

## 🚀 Deployment Overview

### Architecture
- **Frontend**: React SPA with Vite build system
- **Backend**: Node.js API server (separate repository)
- **Database**: MongoDB
- **Database**: PostgreSQL via Supabase
- **File Storage**: Cloud storage for certificates and images
- **File Storage**: Supabase Storage for videos, certificates, and images
- **CDN**: Content delivery network for static assets

### Deployment Options
1. **Development**: Local development environment
2. **Staging**: Testing environment for QA
3. **Production**: Live production environment

## 🔧 Environment Configuration

### Environment Variables

#### Frontend (.env)
```env
# API Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true

# External Services
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=SENTRY_DSN_URL
```

#### Supabase Configuration
The platform uses Supabase for:
- **Authentication** - User login and registration
- **Database** - PostgreSQL with Row Level Security
- **Storage** - File uploads (videos, certificates, images)
- **Real-time** - Live updates and notifications

## 🏗 Build Process

### Frontend Build

#### Development Build
```bash
npm run dev
```

#### Production Build
```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Environment-Specific Builds
```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```
#### Build Optimization
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
```

### Database Setup

#### Supabase Migration
```sql
-- Run the enhanced schema migration
-- Copy from supabase/migrations/enhanced_schema.sql
-- Execute in Supabase SQL Editor
```

#### Storage Buckets
```bash
# Create storage buckets via Supabase dashboard:
# 1. profile-pictures (Public)
# 2. certificates (Private)
# 3. videos (Private)
```

## ☁️ Cloud Deployment

### Vercel (Frontend)

#### Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Deployment Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### Netlify (Frontend)

#### Configuration
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  VITE_SUPABASE_URL = "https://your-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your_anon_key_here"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Environment Variables
Set in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`
- `VITE_GOOGLE_ANALYTICS_ID`
- `VITE_SENTRY_DSN`

### AWS (Frontend Only)

#### S3 + CloudFront (Frontend)
```bash
# Build application
npm run build

# Sync to S3
aws s3 sync dist/ s3://craftlab-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

### Digital Ocean (Frontend)

#### App Platform Configuration
```yaml
# .do/app.yaml
name: craftlab
services:
- name: frontend
  source_dir: /
  github:
    repo: your-org/craftlab-frontend
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: VITE_SUPABASE_URL
    value: https://your-project.supabase.co
  - key: VITE_SUPABASE_ANON_KEY
    value: your_anon_key_here
```

## 🐳 Docker Deployment

### Frontend Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - supabase
    environment:
      - VITE_SUPABASE_URL=https://your-project.supabase.co
      - VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: craftlab-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: craftlab-frontend
  template:
    metadata:
      labels:
        app: craftlab-frontend
    spec:
      containers:
      - name: frontend
        image: craftlab/frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_URL
          value: "https://your-project.supabase.co"
---
apiVersion: v1
kind: Service
metadata:
  name: craftlab-frontend-service
spec:
  selector:
    app: craftlab-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

## 🔒 Security Configuration

### HTTPS Setup

#### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d craftlab.com -d www.craftlab.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Supabase Custom Domain (Optional)
```bash
# Configure custom domain in Supabase dashboard
# Update DNS records to point to Supabase
# Update environment variables with custom domain
```
#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/craftlab
server {
    listen 80;
    server_name craftlab.com www.craftlab.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name craftlab.com www.craftlab.com;

    ssl_certificate /etc/letsencrypt/live/craftlab.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/craftlab.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Frontend (SPA)
    location / {
        root /var/www/craftlab/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Supabase proxy (optional)
    location /supabase/ {
        proxy_pass https://your-project.supabase.co/;
        proxy_set_header Host your-project.supabase.co;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

## 📊 Monitoring & Analytics

### Application Monitoring

#### Supabase Monitoring
- **Dashboard Metrics** - Built-in analytics
- **Real-time Logs** - Database and API logs
- **Performance Metrics** - Query performance
- **Usage Statistics** - API calls and storage usage

#### Frontend Health Checks
```javascript
// Frontend health check
const healthCheck = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return { status: 'healthy', database: !error };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

### Error Tracking

#### Sentry Integration
```javascript
// Frontend (main.tsx)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

// Supabase error tracking
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    Sentry.setUser({ id: session.user.id, email: session.user.email });
  }
});
```

### Analytics

#### Google Analytics
```javascript
// Frontend analytics
import { gtag } from 'ga-gtag';

gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
  page_title: document.title,
  page_location: window.location.href,
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### Frontend Deployment
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

#### Database Migration Pipeline
```yaml
# .github/workflows/migrate-database.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Supabase CLI
      uses: supabase/setup-cli@v1
      with:
        version: latest
    
    - name: Run migrations
      run: |
        supabase db push
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/craftlab-backend
          git pull origin main
          npm ci
          pm2 restart craftlab-api
```

## 🚨 Backup & Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/craftlab" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR/$DATE

mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/$DATE

# Upload to S3
aws s3 sync $BACKUP_DIR/$DATE s3://craftlab-backups/$DATE

# Clean old backups (keep 30 days)
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;
```

### File Backup
```bash
# Backup uploaded files
rsync -av /var/www/craftlab/uploads/ /backup/uploads/

# S3 sync
aws s3 sync /var/www/craftlab/uploads/ s3://craftlab-files/uploads/
```

### Recovery Procedures
```bash
# Restore database
mongorestore --uri="mongodb://localhost:27017/craftlab" /backup/20240101/craftlab

# Restore files
rsync -av /backup/uploads/ /var/www/craftlab/uploads/
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates valid
- [ ] Backup procedures tested
- [ ] Monitoring configured
- [ ] Security headers implemented

### Deployment
- [ ] Build application successfully
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Monitor for errors

### Post-deployment
- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Update documentation
- [ ] Notify stakeholders

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

#### Database Connection Issues
```javascript
// Add connection retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error('MongoDB connection failed:', err);
    setTimeout(connectWithRetry, 5000);
  });
};
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect craftlab.com:443
```

### Performance Issues
```bash
# Check server resources
htop
df -h
free -m

# Monitor application
pm2 monit
pm2 logs --lines 100
```

---

For deployment support, contact the DevOps team at devops@craftlab.com.