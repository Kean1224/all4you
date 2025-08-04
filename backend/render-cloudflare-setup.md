# Render Deployment Setup for All4You Auctions Backend

## Quick Deploy to Render

### Option 1: Auto Deploy (Recommended)
1. Connect your GitHub repository to Render
2. Use the `render.yaml` file in the root directory for automatic configuration
3. Set sensitive environment variables in Render Dashboard

### Option 2: Manual Setup
Create a new Web Service in Render Dashboard with these settings:

## Render Service Configuration

### Basic Settings
- **Name:** all4you-backend
- **Environment:** Node
- **Plan:** Free (upgrade as needed)
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Root Directory:** `backend` (if deploying from monorepo)

### Environment Variables
Set these in your Render service dashboard:

**Go to:** Render Dashboard → Your Backend Service → Environment

**Required Variables:**

```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://www.all4youauctions.co.za
FRONTEND_URL=https://www.all4youauctions.co.za

# Google Workspace SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@all4youauctions.co.za
SMTP_PASS=your-app-password-here
SMTP_FROM=admin@all4youauctions.co.za

# Alternative SMTP variable names for compatibility
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=admin@all4youauctions.co.za
EMAIL_PASS=your-app-password-here

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-now
JWT_EXPIRES_IN=7d

# Debug
EMAIL_DEBUG=false
```

**Important:** Replace `your-app-password-here` with your actual Google App Password.

## Deployment Steps

### 1. Deploy to Render
1. **Connect Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository `kean1224/all4you`

2. **Configure Service:**
   - **Name:** all4you-backend
   - **Root Directory:** `backend` (if using monorepo)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`

3. **Set Environment Variables:**
   - Add all the variables listed above in the Render dashboard
   - Use the "Add Environment Variable" button for each one

### 2. Custom Domain Setup
1. **In Render Dashboard:**
   - Go to your service → Settings → Custom Domains
   - Add: `api.all4youauctions.co.za`

2. **In Cloudflare DNS:**
   - Add CNAME record: `api` → `your-render-url.onrender.com`
   - Set to "Proxied" (Orange Cloud)

### 3. SSL/TLS Configuration
- **Cloudflare SSL/TLS Mode:** Full (Strict)
- Render automatically provides SSL certificates

## Testing Your Deployment

### 1. Health Check
```bash
# Test if backend is running
curl https://api.all4youauctions.co.za/health

# Test environment configuration
curl https://api.all4youauctions.co.za/api/ping
```

### 2. Email Testing
```bash
# Test email verification
curl -X POST https://api.all4youauctions.co.za/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Frontend Configuration Update

Update your frontend to use the Render backend URL:

**File:** `frontend/.env.production`
```
NEXT_PUBLIC_API_URL=https://api.all4youauctions.co.za
NEXT_PUBLIC_WS_URL=wss://api.all4youauctions.co.za
NEXT_PUBLIC_BASE_URL=https://www.all4youauctions.co.za
```

## Troubleshooting

### Backend Won't Start
1. Check Render service logs
2. Verify all environment variables are set
3. Ensure `package.json` has correct start script

### CORS Issues
- Frontend URL must be in CORS whitelist
- Check that `FRONTEND_URL` environment variable is correct

### Email Issues
- Verify Google App Password is correct
- Check SMTP settings in environment variables
- Test email configuration with the test endpoint

### WebSocket Issues
- Render supports WebSockets on paid plans
- Free tier may have limitations for real-time features

## Monitoring and Maintenance

### Render Dashboard
- Monitor service health and logs
- Set up alerts for downtime
- Review resource usage

### Domain Management
- Monitor SSL certificate status
- Check Cloudflare analytics
- Review security settings

## Production Checklist

- [ ] Environment variables set in Render
- [ ] Custom domain configured
- [ ] SSL/TLS working
- [ ] Email system functional
- [ ] Frontend pointing to correct API URL
- [ ] WebSocket server operational
- [ ] CORS properly configured
- [ ] File uploads working
- [ ] Database connections stable
