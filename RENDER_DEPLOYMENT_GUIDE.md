# 🚀 G88 Render Deployment Guide

## Prerequisites
- Render account (https://render.com)
- GitHub repository connected
- Domain: api.g88app.com (optional but recommended)

---

## Step 1: Create Render Blueprint Deployment

### Option A: Automatic (Recommended)
1. Go to https://dashboard.render.com/blueprints
2. Click **"New Blueprint Instance"**
3. Connect your GitHub repo: `chat-copilot/backend`
4. Select `render.yaml` as the blueprint file
5. Click **"Apply"**

### Option B: Manual Services
If blueprint doesn't work, create services manually:

#### 1.1 Create PostgreSQL Database
```
Name: g88-postgres
Plan: Starter ($7/mo) or Free
Region: Oregon (closest to users)
Version: PostgreSQL 15
Database: g88db_production
User: g88user
```

**⚠️ Important: PostGIS Extension**
After creation, connect via psql and run:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

#### 1.2 Create Redis Instance
```
Name: g88-redis
Plan: Starter ($7/mo) or Free
Region: Oregon
Max Memory Policy: allkeys-lru
```

#### 1.3 Create Web Service
```
Name: g88-backend
Environment: Node
Region: Oregon
Branch: main (or your production branch)
Build Command: npm install && npm run build
Start Command: npm run start:prod
Health Check Path: /api/v1/health
```

---

## Step 2: Configure Environment Variables

Go to: Render Dashboard → g88-backend → Environment

### Auto-Linked Variables (from other services)
These should auto-populate if using Blueprint:
- `DATABASE_URL` (from g88-postgres)
- `REDIS_URL` (from g88-redis)

### Manual Variables (REQUIRED)
Add these manually in Render dashboard:

```bash
# Server
PORT=3001
NODE_ENV=production

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=<generate_64_byte_hex>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<generate_another_64_byte_hex>
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Twilio (https://console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxx

# SendGrid (https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.xxxxx

# AWS S3
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIA2QGPX7JQI5FZRUWN
AWS_SECRET_ACCESS_KEY=XYTr2FxoMz3C8wMPBVaxOaHn+mIWckFBlLbGMWM
AWS_S3_BUCKET=g88-uploads-production

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# AWS Rekognition
AWS_REKOGNITION_COLLECTION_ID=g88-faces-production
```

---

## Step 3: Custom Domain Setup

1. Go to Render Dashboard → g88-backend → Settings → Custom Domain
2. Add domain: `api.g88app.com`
3. Copy the DNS target (e.g., `g88-backend-xxxx.onrender.com`)
4. In your DNS provider, add CNAME record:
   ```
   Type: CNAME
   Name: api
   Value: g88-backend-xxxx.onrender.com
   ```
5. Wait for SSL certificate (automatic via Let's Encrypt)

---

## Step 4: Run Database Migrations

After deployment, run migrations via Render Shell:

1. Go to g88-backend → Shell
2. Run:
```bash
npm run migration:run
```

Or create a one-off job:
```bash
npm run typeorm migration:run -d dist/config/typeorm.config.js
```

---

## Step 5: Verify Deployment

### Health Check
```bash
curl https://api.g88app.com/api/v1/health
# Expected: {"status":"ok","timestamp":"..."}
```

### API Documentation
```
https://api.g88app.com/api/docs
```

---

## Troubleshooting

### Build Fails
- Check Node version matches `package.json` engines
- Ensure all dependencies in `package.json`
- Check build logs for TypeScript errors

### Database Connection Failed
- Verify DATABASE_URL is correctly linked
- Check if PostGIS extension is installed
- Ensure IP allowlist includes Render services

### Redis Connection Failed
- Verify REDIS_URL is correctly linked
- Check Redis service is running

### Health Check Fails
- Endpoint must return 200 OK
- Check `/api/v1/health` route exists
- Verify all required env vars are set

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| g88-backend | Starter | $7/mo |
| g88-postgres | Starter | $7/mo |
| g88-redis | Starter | $7/mo |
| **Total** | | **$21/mo** |

*Note: Free tier available but with limitations (sleeps after 15min inactivity)*

---

## Quick Deploy Command

If using Render CLI:
```bash
cd backend
render blueprint apply
```

---

## Next Steps After Deployment

1. ✅ Verify health endpoint
2. ✅ Run database migrations
3. ✅ Test API endpoints
4. ✅ Configure Stripe webhooks with new URL
5. ✅ Update mobile `.env.production` with actual URL
6. ✅ Test mobile app against production backend
