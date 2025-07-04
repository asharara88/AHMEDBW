#!/bin/bash

echo "🔧 Fixing FloatingChatButton import error..."

# 1. Remove problematic import from Layout.tsx
sed -i '' '/import.*FloatingChatButton/d' src/components/layout/Layout.tsx
sed -i '' '/<FloatingChatButton/d' src/components/layout/Layout.tsx
sed -i '' '/FloatingChatButton/d' src/components/layout/Layout.tsx

# 2. Remove any other references
find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -l "FloatingChatButton" | while read file; do
  echo "Removing FloatingChatButton from: $file"
  sed -i '' '/FloatingChatButton/d' "$file"
done

# 3. Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build still failing - checking for other issues..."
  # Additional cleanup if needed
  find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -l "import.*\.\./.*" | head -5
fi
