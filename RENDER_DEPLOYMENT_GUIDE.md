# All4You Auctioneers - Render Deployment Guide

Both frontend and backend are configured to deploy on Render.com

## Quick Deploy

1. Connect your GitHub repo to Render
2. Use 'New Blueprint' and select render.yaml
3. Set SMTP_PASS environment variable in backend service dashboard

## Service URLs
- Frontend: https://all4you-frontend.onrender.com  
- Backend: https://all4you-backend.onrender.com

## Environment Files
- frontend/.env.render - Frontend environment variables
- backend/.env.render - Backend environment variables

## Key Changes Made
- Updated CORS to include Render URLs
- Next.js image config supports Render hostnames
- WebSocket URLs configured for Render
- render.yaml includes both services
