#!/bin/bash
set -e

echo "🚀 DEPLOYING BIOWELL TO NETLIFY"
echo "================================"

# Install Netlify CLI if not installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to production
echo "🚀 Deploying to production..."
netlify deploy --prod --dir=dist

echo "✅ Deployment complete!"
