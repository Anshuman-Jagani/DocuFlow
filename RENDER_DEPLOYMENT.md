# Render.com Deployment Guide

## Why Render.com?

✅ **Free Forever** - Not just 30 days like Railway  
✅ **Free PostgreSQL** - Included in free tier  
✅ **Auto-deploys** - From GitHub on every push  
✅ **No Credit Card** - Required for free tier  
✅ **Perfect for Demos** - Great for April presentation  

⚠️ **Only Limitation:** Free tier spins down after 15 minutes of inactivity (wakes up in ~30 seconds)

---

## Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Git installed locally
- Node.js 18+ installed locally

---

## Quick Start (Recommended)

### Option 1: Deploy with Blueprint (Easiest)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Day 10: Render deployment prep"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com) and sign in
   - Click **"New"** → **"Blueprint"**
   - Connect your GitHub account
   - Select your `DocuFlow` repository
   - Render will automatically detect `render.yaml`
   - Click **"Apply"**
   - Wait 5-10 minutes for deployment

3. **Done!** Your API will be live at: `https://docuflow-api.onrender.com`

---

## Option 2: Manual Setup (More Control)

### Step 1: Create PostgreSQL Database

1. Go to [render.com](https://render.com) dashboard
2. Click **"New"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `docuflow-db`
   - **Database:** `docuflow`
   - **User:** `docuflow`
   - **Region:** Oregon (or closest to you)
   - **Plan:** Free
4. Click **"Create Database"**
5. **Save the connection details** (you'll need them)

### Step 2: Create Web Service

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `docuflow-api`
   - **Region:** Oregon (same as database)
   - **Branch:** `main`
   - **Root Directory:** (leave blank)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Configure Environment Variables

In your web service settings, add these environment variables:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars-change-this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important:** Add `DATABASE_URL` from your PostgreSQL database:
1. Go to your PostgreSQL database in Render
2. Copy the **"Internal Database URL"**
3. Add it as `DATABASE_URL` environment variable in your web service

### Step 4: Run Database Migrations

After first deployment:

1. Go to your web service in Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run migrate:prod
   ```

Or add to your `render.yaml` (already included):
```yaml
buildCommand: npm install && npx sequelize-cli db:migrate
```

### Step 5: Deploy

Click **"Manual Deploy"** → **"Deploy latest commit"**

Your API will be live at: `https://your-service-name.onrender.com`

---

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | postgres://user:pass@host/db | PostgreSQL connection (from Render DB) |
| `JWT_SECRET` | Yes | min-32-characters-long | Secret key for JWT tokens |
| `REFRESH_TOKEN_SECRET` | Yes | min-32-characters-long | Secret for refresh tokens |
| `NODE_ENV` | Yes | production | Environment mode |
| `PORT` | No | 10000 | Render sets this automatically |
| `ALLOWED_ORIGINS` | No | https://yourapp.vercel.app | Comma-separated CORS origins |
| `JWT_EXPIRES_IN` | No | 7d | JWT expiration time |
| `REFRESH_TOKEN_EXPIRES_IN` | No | 30d | Refresh token expiration |
| `MAX_FILE_SIZE` | No | 10485760 | Max upload size (10MB) |

---

## Verify Deployment

Test your deployed API:

```bash
# Health check
curl https://your-service-name.onrender.com/health

# Health check with database
curl https://your-service-name.onrender.com/api/v1/health

# API documentation
# Visit: https://your-service-name.onrender.com/api-docs
```

---

## Connect Vercel Frontend

After deploying your frontend to Vercel:

1. Get your Vercel URL (e.g., `https://docuflow.vercel.app`)
2. Update `ALLOWED_ORIGINS` in Render:
   ```env
   ALLOWED_ORIGINS=https://docuflow.vercel.app,http://localhost:3000
   ```
3. Render will automatically redeploy

---

## Troubleshooting

### ❌ Database Connection Issues

**Problem:** App can't connect to database

**Solution:**
- Verify `DATABASE_URL` is set correctly
- Use **Internal Database URL** (not External)
- Check PostgreSQL service is running
- Ensure migrations have been run

### ❌ Build Failures

**Problem:** Build fails during deployment

**Solution:**
- Check build logs in Render dashboard
- Verify `package.json` has all dependencies
- Ensure Node.js version matches (`engines` field)
- Try clearing build cache: Settings → "Clear build cache & deploy"

### ❌ CORS Errors

**Problem:** Frontend can't access API

**Solution:**
- Add your Vercel URL to `ALLOWED_ORIGINS`
- Format: `https://your-app.vercel.app` (no trailing slash)
- Redeploy after updating environment variables

### ❌ Service Sleeping

**Problem:** First request takes 30+ seconds

**Solution:**
- This is normal for free tier
- Service spins down after 15 minutes of inactivity
- First request wakes it up (~30 seconds)
- For demos: Make a request before presenting
- **Tip:** Use a free uptime monitor (like UptimeRobot) to ping every 14 minutes

### ❌ File Upload Issues

**Problem:** File uploads fail in production

**Solution:**
- Render provides ephemeral storage
- Files are lost on redeploy/restart
- For production, use cloud storage (AWS S3, Cloudinary)
- For demos, uploads work fine during session

---

## Keeping Your Service Awake (Optional)

For your April demo, you can keep the service awake:

### Option 1: UptimeRobot (Free)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor for your health endpoint
3. Set interval to 14 minutes
4. Service stays awake!

### Option 2: Cron-job.org (Free)
1. Sign up at [cron-job.org](https://cron-job.org)
2. Create job to ping `/health` every 14 minutes
3. Service stays awake!

---

## Render Dashboard Features

### View Logs
1. Go to your web service
2. Click **"Logs"** tab
3. Real-time logs appear here

### Shell Access
1. Click **"Shell"** tab
2. Run commands directly on your server
3. Useful for migrations, debugging

### Metrics
1. Click **"Metrics"** tab
2. View CPU, memory, bandwidth usage

---

## Auto-Deploy on Git Push

Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render automatically deploys!
```

Disable auto-deploy:
- Settings → Auto-Deploy → Toggle off

---

## Custom Domain (Optional)

1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed
4. Free SSL certificate included!

---

## Render vs Railway Comparison

| Feature | Render Free | Railway Free |
|---------|-------------|--------------|
| **Duration** | ✅ Forever | ⚠️ 30 days only |
| **PostgreSQL** | ✅ Free | ✅ Free |
| **Auto-deploy** | ✅ Yes | ✅ Yes |
| **Sleep after inactivity** | ⚠️ 15 mins | ❌ No sleep |
| **Credit card required** | ❌ No | ❌ No |
| **Best for** | ✅ Demos, learning | ⏱️ Short-term testing |

---

## Production Checklist

- ✅ PostgreSQL database created
- ✅ Web service deployed
- ✅ Environment variables configured
- ✅ Database migrations run
- ✅ Health endpoints working
- ✅ Swagger docs accessible
- ✅ CORS configured for frontend
- ✅ Auto-deploy enabled

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Run database migrations
3. ✅ Test API endpoints
4. 🔄 Deploy frontend to Vercel
5. 🔄 Update CORS with Vercel URL
6. 🔄 Test full integration
7. 🎯 Ready for April demo!

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Project Repository:** https://github.com/Anshuman-Jagani/DocuFlow
- **API Documentation:** `/api-docs` on your deployed URL

---

## Tips for April Demo

1. **Wake up service before demo:**
   ```bash
   curl https://your-service.onrender.com/health
   ```

2. **Seed demo data:**
   - Use Render Shell to run: `npm run seed`
   - Or seed locally and let data persist

3. **Monitor during demo:**
   - Keep Render dashboard open
   - Watch logs in real-time
   - Check metrics

4. **Backup plan:**
   - Have local development running as backup
   - Export important data before demo

---

**Last Updated:** February 5, 2026  
**DocuFlow Version:** 1.0.0  
**Deployment Platform:** Render.com (Free Forever)
