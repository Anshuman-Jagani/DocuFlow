# DocuFlow Frontend Deployment Guide

This guide covers deploying the DocuFlow frontend to various hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Backend API is deployed and accessible
- [ ] Production build tested locally (`npm run build` + `npm run preview`)
- [ ] CORS configured on backend to allow frontend domain
- [ ] All critical features tested
- [ ] Error tracking configured (optional)

## 🌐 Platform-Specific Deployment

### Vercel (Recommended)

Vercel offers the best DX for Vite/React apps with zero-config deployments.

#### Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set environment variables**:
   ```bash
   vercel env add VITE_API_URL production
   # Enter your production API URL when prompted
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

#### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your production backend URL
6. Click "Deploy"

---

### Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Create `netlify.toml`** in frontend directory:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Set build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/dist`
   - Add environment variable: `VITE_API_URL`
   - Click "Deploy site"

4. **Deploy via CLI**:
   ```bash
   cd frontend
   netlify deploy --prod
   ```

---

### GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `vite.config.ts`**:
   ```typescript
   export default defineConfig({
     base: '/DocuFlow/', // Replace with your repo name
     // ... rest of config
   });
   ```

3. **Add deploy script to `package.json`**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: `gh-pages` branch
   - Save

> **Note**: GitHub Pages is static hosting only. Ensure your backend API supports CORS for the GitHub Pages domain.

---

### AWS S3 + CloudFront

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://docuflow-frontend
   ```

3. **Configure bucket for static hosting**:
   ```bash
   aws s3 website s3://docuflow-frontend \
     --index-document index.html \
     --error-document index.html
   ```

4. **Upload build files**:
   ```bash
   aws s3 sync dist/ s3://docuflow-frontend --delete
   ```

5. **Set up CloudFront distribution**:
   - Create CloudFront distribution pointing to S3 bucket
   - Configure custom error responses (404 → /index.html)
   - Add SSL certificate
   - Set environment variables via build process or runtime config

---

### Docker Deployment

1. **Create `Dockerfile`** in frontend directory:
   ```dockerfile
   # Build stage
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   ARG VITE_API_URL
   ENV VITE_API_URL=$VITE_API_URL
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create `nginx.conf`**:
   ```nginx
   server {
     listen 80;
     server_name _;
     root /usr/share/nginx/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     # Enable gzip compression
     gzip on;
     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

3. **Build Docker image**:
   ```bash
   docker build \
     --build-arg VITE_API_URL=https://api.docuflow.com \
     -t docuflow-frontend .
   ```

4. **Run container**:
   ```bash
   docker run -p 80:80 docuflow-frontend
   ```

---

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
VITE_API_URL=https://api.yourdomain.com
```

### Runtime Configuration (Alternative)

For deployments where environment variables can't be set at build time, use runtime configuration:

1. **Create `public/config.js`**:
   ```javascript
   window.ENV = {
     VITE_API_URL: 'https://api.yourdomain.com'
   };
   ```

2. **Load in `index.html`**:
   ```html
   <script src="/config.js"></script>
   ```

3. **Use in code**:
   ```typescript
   const API_URL = window.ENV?.VITE_API_URL || import.meta.env.VITE_API_URL;
   ```

---

## 🔒 Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS Configuration**: Ensure backend allows your frontend domain
3. **API Keys**: Never commit API keys to version control
4. **Content Security Policy**: Add CSP headers via hosting platform
5. **Environment Variables**: Use platform-specific secret management

---

## 🚀 Performance Optimization

### Build Optimization

1. **Analyze bundle size**:
   ```bash
   npm run build -- --mode analyze
   ```

2. **Enable compression** (handled by most platforms automatically):
   - Gzip/Brotli compression
   - Minification (automatic with Vite)

3. **Code splitting** (already configured in Vite):
   - Automatic chunk splitting
   - Dynamic imports for routes

### CDN Configuration

1. **Set cache headers** for static assets:
   ```
   /assets/*
     Cache-Control: public, max-age=31536000, immutable
   
   /index.html
     Cache-Control: no-cache
   ```

2. **Enable HTTP/2** (automatic on most platforms)

---

## 📊 Monitoring & Analytics

### Error Tracking

Integrate error tracking (e.g., Sentry):

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### Analytics

Add analytics (e.g., Google Analytics, Plausible):

```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

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
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build
        working-directory: ./frontend
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

---

## 🐛 Troubleshooting

### Common Issues

**404 on page refresh**
- **Solution**: Configure server to redirect all routes to `index.html`
- Vercel/Netlify: Automatic
- Nginx: Use `try_files $uri /index.html`
- Apache: Use `.htaccess` with rewrite rules

**API calls failing**
- Check `VITE_API_URL` is set correctly
- Verify CORS is configured on backend
- Check browser console for errors
- Verify backend is accessible from frontend domain

**Build failures**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (requires 18+)
- Verify all environment variables are set

**Blank page after deployment**
- Check browser console for errors
- Verify `base` path in `vite.config.ts` matches deployment path
- Check if assets are loading (Network tab)

---

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs for errors
3. Test production build locally first: `npm run build && npm run preview`
4. Verify environment variables are set correctly

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] All routes work (no 404s on refresh)
- [ ] API calls succeed
- [ ] Authentication flow works
- [ ] File uploads work
- [ ] All document types display correctly
- [ ] Settings page functions properly
- [ ] Mobile responsiveness verified
- [ ] SSL certificate valid
- [ ] Analytics tracking (if configured)
- [ ] Error tracking (if configured)
