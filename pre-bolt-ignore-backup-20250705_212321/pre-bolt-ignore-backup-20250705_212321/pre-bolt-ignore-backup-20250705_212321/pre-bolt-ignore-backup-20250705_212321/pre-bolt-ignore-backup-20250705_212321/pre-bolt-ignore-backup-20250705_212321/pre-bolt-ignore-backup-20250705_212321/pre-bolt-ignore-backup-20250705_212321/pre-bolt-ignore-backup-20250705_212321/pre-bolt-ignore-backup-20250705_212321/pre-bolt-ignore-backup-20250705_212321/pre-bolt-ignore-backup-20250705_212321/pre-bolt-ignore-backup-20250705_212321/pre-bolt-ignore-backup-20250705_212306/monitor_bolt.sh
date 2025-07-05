#!/bin/bash

echo "📊 MONITORING BOLT BEHAVIOR"
echo "=========================="

# Before running Bolt
echo "Files before Bolt run:"
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.json" | wc -l

# Run your Bolt command here
# bolt your-command

# After running Bolt
echo "Files after Bolt run:"
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.json" | wc -l

# Check for missing files
echo ""
echo "Checking for missing critical files..."
CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "src/main.tsx"
    "src/App.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ MISSING: $file"
    else
        echo "✅ Present: $file"
    fi
done
