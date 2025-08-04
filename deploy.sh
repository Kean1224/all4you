#!/bin/bash

# All4You Auctions - Complete Deployment Script
# Frontend: Vercel | Backend: Render | Domain: Cloudflare

echo "🚀 Starting All4You Auctions Deployment Process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "  Frontend: Vercel (Next.js)"
echo -e "  Backend: Render (Node.js)"
echo -e "  Domain: www.all4youauctions.co.za"
echo -e "  API: api.all4youauctions.co.za"
echo ""

# Step 1: Pre-deployment checks
echo -e "${YELLOW}🔍 Step 1: Pre-deployment Checks${NC}"

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Git working directory is not clean. Please commit changes first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git working directory is clean${NC}"

# Step 2: Update environment configurations
echo -e "${YELLOW}🔧 Step 2: Updating Environment Configurations${NC}"

# Update frontend environment for production
echo -e "Updating frontend environment variables..."
cat > frontend/.env.production << EOF
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://api.all4youauctions.co.za
NEXT_PUBLIC_BACKEND_URL=https://api.all4youauctions.co.za
NEXT_PUBLIC_WS_URL=wss://api.all4youauctions.co.za
NEXT_PUBLIC_BASE_URL=https://www.all4youauctions.co.za
NODE_ENV=production
EOF

echo -e "${GREEN}✅ Frontend environment updated${NC}"

# Step 3: Build and test locally
echo -e "${YELLOW}🔨 Step 3: Building Frontend${NC}"

cd frontend
if npm run build; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

# Step 4: Commit and push changes
echo -e "${YELLOW}📤 Step 4: Pushing to GitHub${NC}"

git add .
git commit -m "Deploy: Configure for Vercel + Render production deployment

- Frontend: Vercel deployment ready
- Backend: Render configuration complete
- Environment: Production URLs configured
- Domain: www.all4youauctions.co.za setup"

git push origin main

echo -e "${GREEN}✅ Code pushed to GitHub${NC}"

# Step 5: Deployment instructions
echo -e "${BLUE}📝 Next Steps - Manual Deployment:${NC}"
echo ""

echo -e "${YELLOW}BACKEND DEPLOYMENT (Render):${NC}"
echo "1. Go to: https://dashboard.render.com"
echo "2. Create New Web Service"
echo "3. Connect GitHub repository: kean1224/all4you"
echo "4. Configure service:"
echo "   - Name: all4you-backend"
echo "   - Root Directory: backend"
echo "   - Build Command: npm install"
echo "   - Start Command: node index.js"
echo "5. Set environment variables (see backend/render-cloudflare-setup.md)"
echo "6. Deploy service"
echo ""

echo -e "${YELLOW}FRONTEND DEPLOYMENT (Vercel):${NC}"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Import Project from GitHub: kean1224/all4you"
echo "3. Configure project:"
echo "   - Framework: Next.js"
echo "   - Root Directory: frontend"
echo "4. Set environment variables (see frontend/VERCEL_SETUP.md)"
echo "5. Deploy project"
echo ""

echo -e "${YELLOW}DOMAIN CONFIGURATION (Cloudflare):${NC}"
echo "1. Add CNAME records in Cloudflare DNS:"
echo "   - www.all4youauctions.co.za → your-vercel-deployment.vercel.app"
echo "   - api.all4youauctions.co.za → your-render-service.onrender.com"
echo "2. Set SSL/TLS mode to 'Full (Strict)'"
echo "3. Enable 'Always Use HTTPS'"
echo ""

echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo -e "${BLUE}📖 Detailed guides available in:${NC}"
echo "  - frontend/VERCEL_SETUP.md"
echo "  - backend/render-cloudflare-setup.md"
echo "  - render.yaml (for automated Render deployment)"
