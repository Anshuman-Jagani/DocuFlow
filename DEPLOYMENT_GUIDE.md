# DocuFlow Deployment Guide

Complete guide for deploying DocuFlow with backend on Render (Blueprint) and frontend on Vercel.

## 🎯 Overview

- **Backend**: Render.com (Free tier, Blueprint deployment)
- **Frontend**: Vercel (Free tier)
- **Database**: PostgreSQL on Render (Free tier)

---

## 📋 Prerequisites

- GitHub account with DocuFlow repository
- Render account ([render.com](https://render.com))
- Vercel account ([vercel.com](https://vercel.com))
- Git installed locally

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Push to GitHub

Ensure your latest code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy with Render Blueprint

1. **Go to Render Dashboard**
   - Visit [render.com/dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**

2. **Connect Repository**
   - Click **"Connect account"** to link your GitHub
   - Select your **DocuFlow** repository
   - Click **"Connect"**

3. **Apply Blueprint**
   - Render will automatically detect `render.yaml` in your repository root
   - Review the services that will be created:
     - `docuflow-api` (Web Service)
     - `docuflow-db` (PostgreSQL Database)
   - Click **"Apply"**

4. **Wait for Deployment**
   - Database creation: ~2 minutes
   - Backend deployment: ~5-8 minutes
   - Watch the build logs for any errors

5. **Get Your Backend URL**
   - Once deployed, you'll see your service at: `https://docuflow-api-XXXX.onrender.com`
   - **Save this URL** - you'll need it for the frontend!

### Step 3: Verify Backend Deployment

Test your deployed API:

```bash
# Replace with your actual Render URL
curl https://docuflow-api-XXXX.onrender.com/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

Visit the API documentation:
```
https://docuflow-api-XXXX.onrender.com/api-docs
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**

2. **Import Repository**
   - Click **"Import"** next to your DocuFlow repository
   - If not listed, click **"Import Git Repository"** and enter the URL

3. **Configure Project**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: Click **"Edit"** → Select `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)

### Step 2: Configure Environment Variables

Before deploying, add environment variables:

1. Click **"Environment Variables"** section
2. Add the following:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://docuflow-api-XXXX.onrender.com` |

> **Important**: Replace `XXXX` with your actual Render service URL from Part 1, Step 5

3. Click **"Deploy"**

### Step 3: Wait for Deployment

- First deployment: ~2-3 minutes
- Vercel will build and deploy your frontend
- Watch the build logs for any errors

### Step 4: Get Your Frontend URL

Once deployed, Vercel will provide:
- **Production URL**: `https://your-project-name.vercel.app`
- **Save this URL** - you'll need it to update CORS!

---

## 🔗 Part 3: Connect Frontend & Backend

### Update CORS in Render

Your frontend needs to be allowed to access your backend:

1. **Go to Render Dashboard**
   - Navigate to your `docuflow-api` service
   - Click **"Environment"** tab

2. **Update ALLOWED_ORIGINS**
   - Find the `ALLOWED_ORIGINS` variable
   - Click **"Edit"**
   - Update the value to include your Vercel URL:
   ```
   http://localhost:3000,http://localhost:5173,https://your-project-name.vercel.app
   ```
   - Click **"Save Changes"**

3. **Redeploy**
   - Render will automatically redeploy with the new CORS settings
   - Wait ~2-3 minutes for the redeploy to complete

---

## ✅ Part 4: Verify Full Deployment

### Test the Complete Flow

1. **Visit Your Frontend**
   ```
   https://your-project-name.vercel.app
   ```

2. **Test Registration**
   - Click "Sign Up"
   - Create a new account
   - Should successfully register and log in

3. **Test Document Upload**
   - Upload a test document
   - Verify it appears in your documents list

4. **Check Backend Logs**
   - Go to Render dashboard → `docuflow-api` → **Logs** tab
   - Verify requests are coming through

---

## 🔧 Troubleshooting

### ❌ Render: "render.yaml not found"

**Problem**: Render can't find the Blueprint file

**Solution**:
- Ensure `render.yaml` is in the **repository root**, not in `/backend`
- Check the file is committed to Git: `git ls-files | grep render.yaml`
- Push to GitHub: `git push origin main`

### ❌ Backend: Database Connection Failed

**Problem**: Backend can't connect to PostgreSQL

**Solution**:
- Verify the database was created in Render
- Check `DATABASE_URL` is set in environment variables
- View logs in Render dashboard for specific error
- Ensure migrations ran: Check build logs for `db:migrate`

### ❌ Frontend: CORS Error

**Problem**: Browser shows CORS error when calling API

**Solution**:
- Verify `ALLOWED_ORIGINS` in Render includes your Vercel URL
- Ensure there's no trailing slash: `https://app.vercel.app` ✅ not `https://app.vercel.app/` ❌
- Redeploy backend after updating CORS
- Clear browser cache and try again

### ❌ Frontend: "Failed to fetch" or Network Error

**Problem**: Frontend can't reach backend

**Solution**:
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend is running: Visit `https://your-backend.onrender.com/health`
- Ensure backend URL doesn't have trailing slash
- Check browser console for exact error

### ❌ Render: Service Sleeping / Slow First Request

**Problem**: First request takes 30+ seconds

**Solution**:
- **This is normal** for Render free tier
- Service spins down after 15 minutes of inactivity
- First request wakes it up (~30 seconds)
- **For demos**: Make a request 1-2 minutes before presenting
- **Optional**: Use [UptimeRobot](https://uptimerobot.com) to ping every 14 minutes

### ❌ Vercel: Build Failed

**Problem**: TypeScript or build errors

**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Test build locally: `cd frontend && npm run build`
- Fix any TypeScript errors shown in logs

---

## 📝 Environment Variables Reference

### Backend (Render)

These are automatically configured by `render.yaml`:

| Variable | Value | Source |
|----------|-------|--------|
| `NODE_ENV` | `production` | Blueprint |
| `PORT` | `10000` | Blueprint |
| `DATABASE_URL` | Auto-generated | From database |
| `JWT_SECRET` | Auto-generated | Blueprint |
| `REFRESH_TOKEN_SECRET` | Auto-generated | Blueprint |
| `JWT_EXPIRES_IN` | `7d` | Blueprint |
| `REFRESH_TOKEN_EXPIRES_IN` | `30d` | Blueprint |
| `MAX_FILE_SIZE` | `10485760` | Blueprint |
| `UPLOAD_DIR` | `./uploads` | Blueprint |
| `ALLOWED_ORIGINS` | **Update manually** | Blueprint (update with Vercel URL) |
| `N8N_WEBHOOK_SECRET` | Auto-generated | Blueprint |
| `N8N_BASE_URL` | `https://your-n8n-instance.com` | Blueprint (optional) |

### Frontend (Vercel)

Set these manually in Vercel:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Your Render backend URL | `https://docuflow-api-xxxx.onrender.com` |

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed successfully on Render
- [ ] Database created and migrations ran
- [ ] Backend health check responds: `/health`
- [ ] API docs accessible: `/api-docs`
- [ ] Frontend deployed successfully on Vercel
- [ ] Environment variable `VITE_API_URL` set in Vercel
- [ ] CORS updated in Render with Vercel URL
- [ ] Can register new user from frontend
- [ ] Can log in from frontend
- [ ] Can upload documents from frontend
- [ ] Documents appear in dashboard

---

## 🔄 Updating Your Deployment

### Update Backend

```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys from main branch
```

### Update Frontend

```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys from main branch
```

### Manual Redeploy

**Render**: Dashboard → Service → **"Manual Deploy"** → **"Deploy latest commit"**

**Vercel**: Dashboard → Project → **Deployments** → **"Redeploy"**

---

## 💡 Tips for Production

### Keep Backend Awake (Optional)

For important demos or presentations:

1. **Use UptimeRobot** (Free)
   - Sign up at [uptimerobot.com](https://uptimerobot.com)
   - Create HTTP(s) monitor
   - URL: `https://your-backend.onrender.com/health`
   - Interval: 14 minutes
   - Service stays awake!

2. **Pre-warm Before Demo**
   ```bash
   # Run this 2-3 minutes before your demo
   curl https://your-backend.onrender.com/health
   ```

### Monitor Your Services

- **Render Logs**: Dashboard → Service → **Logs** tab
- **Vercel Logs**: Dashboard → Project → **Deployments** → Click deployment → **Logs**
- **Render Metrics**: Dashboard → Service → **Metrics** tab

### Custom Domains (Optional)

**Vercel**:
1. Dashboard → Project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Free SSL included!

**Render**:
1. Dashboard → Service → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records
4. Free SSL included!

---

## 📚 Additional Resources

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Render Community**: https://community.render.com
- **Vercel Community**: https://github.com/vercel/vercel/discussions

---

## 🆘 Need Help?

1. **Check Logs**
   - Render: Dashboard → Service → Logs
   - Vercel: Dashboard → Project → Deployments → Logs

2. **Common Issues**
   - See Troubleshooting section above
   - Check environment variables are set correctly
   - Verify CORS configuration

3. **Test Locally First**
   ```bash
   # Backend
   cd backend
   npm install
   npm start

   # Frontend (in new terminal)
   cd frontend
   npm install
   npm run build
   npm run preview
   ```

---

**Last Updated**: February 12, 2026  
**DocuFlow Version**: 1.0.0  
**Deployment Stack**: Render (Backend) + Vercel (Frontend)
