# All4You Auctions - Complete Deployment Script (PowerShell)
# Frontend: Vercel | Backend: Render | Domain: Cloudflare

Write-Host "🚀 Starting All4You Auctions Deployment Process..." -ForegroundColor Green

Write-Host "📋 Deployment Configuration:" -ForegroundColor Blue
Write-Host "  Frontend: Vercel (Next.js)"
Write-Host "  Backend: Render (Node.js)"  
Write-Host "  Domain: www.all4youauctions.co.za"
Write-Host "  API: api.all4youauctions.co.za"
Write-Host ""

# Step 1: Pre-deployment checks
Write-Host "🔍 Step 1: Pre-deployment Checks" -ForegroundColor Yellow

# Check if git is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Git working directory is not clean. Please commit changes first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git working directory is clean" -ForegroundColor Green

# Step 2: Update environment configurations
Write-Host "🔧 Step 2: Updating Environment Configurations" -ForegroundColor Yellow

# Update frontend environment for production
Write-Host "Updating frontend environment variables..."
$envContent = @"
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://api.all4youauctions.co.za
NEXT_PUBLIC_BACKEND_URL=https://api.all4youauctions.co.za
NEXT_PUBLIC_WS_URL=wss://api.all4youauctions.co.za
NEXT_PUBLIC_BASE_URL=https://www.all4youauctions.co.za
NODE_ENV=production
"@

$envContent | Out-File -FilePath "frontend\.env.production" -Encoding UTF8

Write-Host "✅ Frontend environment updated" -ForegroundColor Green

# Step 3: Build and test locally
Write-Host "🔨 Step 3: Building Frontend" -ForegroundColor Yellow

Set-Location frontend
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Step 4: Commit and push changes
Write-Host "📤 Step 4: Pushing to GitHub" -ForegroundColor Yellow

git add .
git commit -m "Deploy: Configure for Vercel + Render production deployment

- Frontend: Vercel deployment ready
- Backend: Render configuration complete
- Environment: Production URLs configured
- Domain: www.all4youauctions.co.za setup"

git push origin main

Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green

# Step 5: Deployment instructions
Write-Host "📝 Next Steps - Manual Deployment:" -ForegroundColor Blue
Write-Host ""

Write-Host "BACKEND DEPLOYMENT (Render):" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.render.com"
Write-Host "2. Create New Web Service"
Write-Host "3. Connect GitHub repository: kean1224/all4you"
Write-Host "4. Configure service:"
Write-Host "   - Name: all4you-backend"
Write-Host "   - Root Directory: backend"
Write-Host "   - Build Command: npm install"
Write-Host "   - Start Command: node index.js"
Write-Host "5. Set environment variables (see backend/render-cloudflare-setup.md)"
Write-Host "6. Deploy service"
Write-Host ""

Write-Host "FRONTEND DEPLOYMENT (Vercel):" -ForegroundColor Yellow
Write-Host "1. Go to: https://vercel.com/dashboard"
Write-Host "2. Import Project from GitHub: kean1224/all4you"
Write-Host "3. Configure project:"
Write-Host "   - Framework: Next.js"
Write-Host "   - Root Directory: frontend"
Write-Host "4. Set environment variables (see frontend/VERCEL_SETUP.md)"
Write-Host "5. Deploy project"
Write-Host ""

Write-Host "DOMAIN CONFIGURATION (Cloudflare):" -ForegroundColor Yellow
Write-Host "1. Add CNAME records in Cloudflare DNS:"
Write-Host "   - www.all4youauctions.co.za → your-vercel-deployment.vercel.app"
Write-Host "   - api.all4youauctions.co.za → your-render-service.onrender.com"
Write-Host "2. Set SSL/TLS mode to 'Full (Strict)'"
Write-Host "3. Enable 'Always Use HTTPS'"
Write-Host ""

Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host "📖 Detailed guides available in:" -ForegroundColor Blue
Write-Host "  - frontend/VERCEL_SETUP.md"
Write-Host "  - backend/render-cloudflare-setup.md"
Write-Host "  - render.yaml (for automated Render deployment)"
