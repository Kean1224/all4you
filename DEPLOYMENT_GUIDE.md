# All4You Auctions - Render + Vercel Deployment Guide

## 🏗️ Architecture Overview

**Frontend (Vercel):** Next.js application deployed on Vercel
- Domain: https://www.all4youauctions.co.za
- Framework: Next.js with TypeScript and Tailwind CSS
- Deployment: Auto-deploy from GitHub main branch

**Backend (Render):** Node.js API server deployed on Render  
- Domain: https://api.all4youauctions.co.za
- Framework: Express.js with WebSocket support
- Database: JSON file storage
- Deployment: Auto-deploy from GitHub main branch

## 🚀 Quick Deployment Steps

### Prerequisites
- [GitHub Account](https://github.com) with repository access
- [Vercel Account](https://vercel.com) 
- [Render Account](https://render.com)
- [Cloudflare Account](https://cloudflare.com) for DNS management

### 1. Deploy Backend to Render

1. **Create Render Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `kean1224/all4you`

2. **Configure Service:**
   ```
   Name: all4you-backend
   Environment: Node
   Root Directory: backend
   Build Command: npm install
   Start Command: node index.js
   ```

3. **Environment Variables:**
   Copy from `backend/render-cloudflare-setup.md` and set in Render dashboard:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://www.all4youauctions.co.za
   FRONTEND_URL=https://www.all4youauctions.co.za
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=admin@all4youauctions.co.za
   SMTP_PASS=your-app-password
   JWT_SECRET=your-secure-jwt-secret
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your Render URL (e.g., `your-service.onrender.com`)

### 2. Deploy Frontend to Vercel

1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import from GitHub: `kean1224/all4you`

2. **Configure Project:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```

3. **Environment Variables:**
   Copy from `frontend/VERCEL_SETUP.md` and set in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://api.all4youauctions.co.za
   NEXT_PUBLIC_BACKEND_URL=https://api.all4youauctions.co.za
   NEXT_PUBLIC_WS_URL=wss://api.all4youauctions.co.za
   NEXT_PUBLIC_BASE_URL=https://www.all4youauctions.co.za
   NODE_ENV=production
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your Vercel URL (e.g., `your-project.vercel.app`)

### 3. Configure Custom Domains (Cloudflare)

1. **Add DNS Records:**
   ```
   Type: CNAME
   Name: www
   Value: your-vercel-project.vercel.app
   Proxy: Proxied (Orange Cloud)

   Type: CNAME  
   Name: api
   Value: your-render-service.onrender.com
   Proxy: Proxied (Orange Cloud)
   ```

2. **SSL/TLS Settings:**
   - SSL/TLS Mode: Full (Strict)
   - Always Use HTTPS: On
   - Automatic HTTPS Rewrites: On

3. **Add Custom Domains:**
   - **Vercel:** Add `www.all4youauctions.co.za` in project settings
   - **Render:** Add `api.all4youauctions.co.za` in service settings

## 🔧 Configuration Files

### render.yaml
Automated Render deployment configuration in root directory.

### vercel.json  
Vercel deployment settings in frontend directory.

### Environment Files
- `frontend/.env.production` - Production environment variables
- `backend/.env.example` - Backend environment template

## 🧪 Testing Your Deployment

### Frontend Tests
```bash
# Check if frontend is accessible
curl https://www.all4youauctions.co.za

# Test API connectivity
curl https://www.all4youauctions.co.za/api/health
```

### Backend Tests  
```bash
# Test backend health
curl https://api.all4youauctions.co.za/health

# Test API endpoint
curl https://api.all4youauctions.co.za/api/ping
```

### Email System Test
```bash
# Test email functionality
curl -X POST https://api.all4youauctions.co.za/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🔄 Auto-Deployment

Both services are configured for automatic deployment:
- **Push to `main` branch** → Triggers deployment on both Render and Vercel
- **Pull Request** → Vercel creates preview deployment
- **Environment Changes** → Restart required in respective dashboards

## 📊 Monitoring

### Render Dashboard
- Service logs and metrics
- Environment variable management
- Custom domain configuration

### Vercel Dashboard  
- Deployment logs and analytics
- Performance monitoring
- Environment variable management

### Cloudflare Dashboard
- DNS management
- SSL certificate status
- Traffic analytics and security

## 🔒 Security Checklist

- [ ] JWT secrets properly configured
- [ ] SMTP passwords secured
- [ ] CORS properly configured for production URLs
- [ ] File upload restrictions enabled
- [ ] Rate limiting configured
- [ ] HTTPS enforced on all endpoints
- [ ] Environment variables not exposed in client

## 🆘 Troubleshooting

### Common Issues

**502 Bad Gateway:**
- Check Render service logs
- Verify environment variables
- Ensure service is running

**CORS Errors:**
- Verify `FRONTEND_URL` in Render environment
- Check browser console for exact error
- Test with curl to isolate frontend vs backend

**Email Not Working:**
- Verify SMTP credentials in Render
- Check Google App Password is correct
- Test email endpoint directly

### Debug Commands
```bash
# Check environment variables
curl https://api.all4youauctions.co.za/api/debug/env

# Test CORS
curl -H "Origin: https://www.all4youauctions.co.za" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://api.all4youauctions.co.za/api/test

# Check service status
curl -I https://api.all4youauctions.co.za/health
```

## 📞 Support Resources

- **Render Docs:** [docs.render.com](https://docs.render.com)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Cloudflare Docs:** [developers.cloudflare.com](https://developers.cloudflare.com)

---

**🎉 Your All4You Auctions platform is now ready for production!**
