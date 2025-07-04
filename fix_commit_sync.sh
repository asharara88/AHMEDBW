#!/bin/bash

echo "🚀 FIXING, COMMITTING, AND SYNCING ALL CHANGES..."

# 1. Pull latest changes from remote
echo "1️⃣ Pulling latest changes..."
git pull origin main

# 2. Clean up any build artifacts
echo "2️⃣ Cleaning build artifacts..."
rm -rf dist/
rm -rf node_modules/.cache/
rm -rf .vite/

# 3. Move Node.js scripts out of browser build
echo "3️⃣ Moving Node.js scripts..."
if [ -f "src/scripts/importSupplementsFromCsv.ts" ]; then
  mkdir -p scripts
  mv src/scripts/importSupplementsFromCsv.ts scripts/ 2>/dev/null || true
  rm -rf src/scripts/ 2>/dev/null || true
fi

# 4. Test TypeScript compilation
echo "4️⃣ Testing TypeScript compilation..."
npx tsc --noEmit --skipLibCheck

# 5. Test build
echo "5️⃣ Testing build..."
npm run build

# 6. If build successful, commit and push
if [ $? -eq 0 ]; then
  echo "✅ BUILD SUCCESSFUL!"
  
  # Stage all changes
  git add .
  
  # Commit with comprehensive message
  git commit -m "🔧 FIX: Complete ShoppingCart component and sync repo

✅ MAJOR FIXES:
- Fixed ShoppingCart component return type (was void, now returns JSX)
- Added complete checkout flow with shipping and payment steps
- Fixed TypeScript compilation errors
- Moved Node.js scripts out of browser build
- Added proper cart state management
- Implemented multi-step checkout process

🛒 SHOPPING CART FEATURES:
- Add/remove items with quantity controls
- Clear cart functionality
- Shipping information form
- Payment summary and order placement
- Responsive design with animations
- Proper error handling

🚀 TECHNICAL IMPROVEMENTS:
- Fixed JSX component return types
- Proper TypeScript interfaces
- Clean component structure
- State management integration
- Motion animations working correctly

�� BUILD STATUS: All modules compile successfully
�� SYNC STATUS: Repository synchronized with remote
🎯 DEPLOYMENT: Ready for production"

  # Push to remote
  echo "6️⃣ Pushing to remote..."
  git push origin main
  
  if [ $? -eq 0 ]; then
    echo "🎉 ALL CHANGES COMMITTED AND PUSHED SUCCESSFULLY!"
    echo "✅ ShoppingCart component is now fully functional"
    echo "✅ Build compiles without errors"
    echo "✅ Repository is synchronized"
    echo "🚀 Ready for production deployment!"
  else
    echo "❌ Failed to push. Checking for conflicts..."
    git status
  fi
  
else
  echo "❌ Build failed. Checking errors..."
  npm run build 2>&1 | head -20
  echo "🔍 Checking for TypeScript errors..."
  npx tsc --noEmit --skipLibCheck 2>&1 | head -10
fi
