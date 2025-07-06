#!/bin/bash

echo "🌍 SETTING UP DEPLOYMENT ENVIRONMENT"
echo "===================================="

# 1. Create .env.production file
echo "1️⃣ Creating production environment file..."
cat > .env.production << 'ENV_EOF'
# Production Environment Variables
NODE_ENV=production
VITE_APP_NAME=BioWell
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_API_URL=https://api.biowell.app
VITE_APP_TITLE=BioWell - Personal Health Dashboard
ENV_EOF

# 2. Update .env.example
echo "2️⃣ Creating environment example..."
cat > .env.example << 'EXAMPLE_EOF'
# Environment Variables Example
NODE_ENV=development
VITE_APP_NAME=BioWell
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=BioWell - Personal Health Dashboard
EXAMPLE_EOF

# 3. Create _redirects file for Netlify
echo "3️⃣ Creating Netlify redirects..."
mkdir -p public
cat > public/_redirects << 'REDIRECTS_EOF'
# Netlify redirects file
/*    /index.html   200

# API redirects (if needed in future)
/api/*  https://api.biowell.app/:splat  200

# Old URLs redirect (if needed)
/dashboard  /home  301
REDIRECTS_EOF

# 4. Create robots.txt
echo "4️⃣ Creating robots.txt..."
cat > public/robots.txt << 'ROBOTS_EOF'
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://biowell-app.netlify.app/sitemap.xml
ROBOTS_EOF

echo "✅ Environment setup complete!"
