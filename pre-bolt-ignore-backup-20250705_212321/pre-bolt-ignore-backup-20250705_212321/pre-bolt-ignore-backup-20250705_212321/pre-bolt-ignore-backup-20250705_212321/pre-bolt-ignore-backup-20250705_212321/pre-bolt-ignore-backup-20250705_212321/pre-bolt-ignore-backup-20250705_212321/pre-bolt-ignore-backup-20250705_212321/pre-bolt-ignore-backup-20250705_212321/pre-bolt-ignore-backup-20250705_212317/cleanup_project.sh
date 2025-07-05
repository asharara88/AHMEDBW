#!/bin/bash

echo "🧹 CLEANING UP PROJECT"
echo "===================="

# Remove common junk files
echo "Removing junk files..."
find . -name "*.log" -type f -delete 2>/dev/null
find . -name "*.tmp" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null

# Clean node_modules if needed
if [ -d "node_modules" ]; then
    echo "Cleaning node_modules..."
    rm -rf node_modules/.cache 2>/dev/null
fi

# Clean build artifacts
echo "Cleaning build artifacts..."
rm -rf dist/ build/ .next/ .nuxt/ coverage/ 2>/dev/null

# Remove old backup files
find . -name "*.bak" -o -name "*.backup" -o -name "*.old" | while read file; do
    echo "Removing backup: $file"
    rm -f "$file"
done

echo "✅ Cleanup complete!"
