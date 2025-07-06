#!/bin/bash

echo "📊 ANALYZING PROJECT SIZE AND STRUCTURE"
echo "======================================"

# Find large directories
echo "🗂️  Large directories (>10MB):"
du -sh */ 2>/dev/null | grep -E "^[0-9.]+[MG]" | sort -hr | head -20

echo ""
echo "📦 Large files (>1MB):"
find . -type f -size +1M -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}' | sort -hr | head -20

echo ""
echo "🔍 File type distribution:"
find . -type f -name "*.*" | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -20

echo ""
echo "�� Total project size:"
du -sh .

echo ""
echo "🗑️  Potential files to ignore:"
find . -name "*.log" -o -name "*.tmp" -o -name "*.cache" -o -name "node_modules" -o -name "dist" -o -name "build" -o -name ".DS_Store" | head -20
