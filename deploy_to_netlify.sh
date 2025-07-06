#!/bin/bash

echo "🚀 DEPLOYING BIOWELL TO NETLIFY"
echo "==============================="

# 1. Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# 2. Build the project
echo "🔨 Building project..."
npm run build

# 3. Deploy to Netlify
echo "🚀 Deploying to Netlify..."
echo ""
echo "🎯 DEPLOYMENT OPTIONS:"
echo "1. New site deployment"
echo "2. Link to existing site"
echo ""

# Deploy with draft first
echo "📡 Creating draft deployment..."
netlify deploy --dir=dist --open

echo ""
echo "✅ DRAFT DEPLOYMENT COMPLETE!"
echo "🔍 Review your site and when ready, run:"
echo "   netlify deploy --dir=dist --prod"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Review the draft deployment"
echo "2. Test all functionality"
echo "3. Deploy to production when satisfied"
