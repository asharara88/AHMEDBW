#!/bin/bash

echo "🚀 EXECUTING COMPLETE NETLIFY DEPLOYMENT"
echo "========================================"

# 1. Install Netlify CLI if not present
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# 2. Build the project
echo "🔨 Building project for production..."
npm run build

# 3. Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "🔑 Please login to Netlify..."
    netlify login
fi

# 4. Deploy to Netlify
echo "🚀 Deploying to Netlify..."
echo ""
echo "🎯 DEPLOYMENT PROCESS:"
echo "1. Creating new site on Netlify"
echo "2. Deploying build files"
echo "3. Configuring custom domain (optional)"
echo ""

# Deploy as new site
netlify deploy --dir=dist --open

echo ""
echo "🎉 DEPLOYMENT INITIATED!"
echo "========================"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Review the draft deployment URL"
echo "2. Test all functionality thoroughly"
echo "3. When satisfied, deploy to production:"
echo "   netlify deploy --dir=dist --prod"
echo ""
echo "🎯 OPTIONAL CONFIGURATIONS:"
echo "- Custom domain: netlify domains:add yourdomain.com"
echo "- Environment variables: netlify env:set KEY=value"
echo "- Continuous deployment: Link to Git repository"
echo ""
echo "📊 MONITORING:"
echo "- Analytics: Enable in Netlify dashboard"
echo "- Forms: Configure if needed"
echo "- Functions: Add serverless functions if needed"
