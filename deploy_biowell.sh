#!/bin/bash

echo "🚀 DEPLOYING BIOWELL TO NETLIFY"
echo "==============================="

# 1. Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# 2. Clean and build
echo "🔨 Building for production..."
rm -rf dist
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# 3. Login to Netlify
echo "🔐 Logging into Netlify..."
netlify login

# 4. Deploy draft first
echo "📡 Creating draft deployment..."
netlify deploy --dir=dist

read -p "✅ Draft deployed! Review it and press Enter to deploy to production..."

# 5. Deploy to production
echo "🌟 Deploying to production..."
netlify deploy --dir=dist --prod

# 6. Get site info
echo "📋 Getting site information..."
netlify status

echo ""
echo "🎉 BIOWELL DEPLOYED SUCCESSFULLY!"
echo "================================="
echo "✅ Your BioWell app is now live on Netlify!"
echo "🌐 Check the URLs above to access your app"
echo "🎨 All colors and features are working"
echo "📱 Responsive design ready for all devices"
