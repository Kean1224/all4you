# Vercel + Render Deployment Setup Guide

## Architecture Overview
- **Frontend:** Vercel (Next.js) - https://www.all4youauctions.co.za
- **Backend:** Render (Node.js) - https://api.all4youauctions.co.za
- **Domain:** Cloudflare DNS Management

## Required Environment Variables for Vercel Deployment

### 1. Production Environment Variables (Set in Vercel Dashboard)

Add these in your Vercel project settings under "Environment Variables":

```bash
# Backend API Configuration (Render)
NEXT_PUBLIC_API_URL=https://api.all4youauctions.co.za
NEXT_PUBLIC_BACKEND_URL=https://api.all4youauctions.co.za
NEXT_PUBLIC_WS_URL=wss://api.all4youauctions.co.za

# Frontend Configuration  
NEXT_PUBLIC_BASE_URL=https://www.all4youauctions.co.za

# Node Environment
NODE_ENV=production
```

### 2. How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with:
   - **Name**: Variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value**: Variable value (e.g., `https://api.all4youauctions.co.za`)
   - **Environment**: Select "Production", "Preview", and "Development"

### 3. Custom Domain Configuration:

Your custom domain: `www.all4youauctions.co.za`
1. Add your domain in Vercel project settings → Domains
2. Configure DNS records as instructed by Vercel:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Or A record pointing to Vercel's IP addresses
3. Vercel will automatically provision SSL certificate

### 4. Backend Integration:

Make sure your backend (if deployed separately) has CORS configured to allow:
- `https://www.all4youauctions.co.za`
- `https://api.all4youauctions.co.za`

### 5. Deployment Commands:

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy with environment variables
vercel --prod
```

### 6. Custom Domain (Optional):

If you want to use your custom domain instead of vercel.app:
1. Add your domain in Vercel project settings
2. Update DNS records as instructed by Vercel
3. Update `NEXT_PUBLIC_BASE_URL` to your custom domain

### 7. Environment Files Priority:

- Vercel will use environment variables set in dashboard
- Local `.env.local` is ignored in production
- `.env.production` can be used as fallback
