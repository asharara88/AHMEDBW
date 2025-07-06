#!/bin/bash
echo "🔄 Fixing MyCoach branding..."
mkdir -p src/pages/coach
find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -l "Health Coach" | while read file; do
    if [[ "$file" != *"node_modules"* ]]; then
        sed -i '' 's/Health Coach/MyCoach/g' "$file"
        echo "✅ Updated $file"
    fi
done
echo "🎉 Branding fixes complete!"
