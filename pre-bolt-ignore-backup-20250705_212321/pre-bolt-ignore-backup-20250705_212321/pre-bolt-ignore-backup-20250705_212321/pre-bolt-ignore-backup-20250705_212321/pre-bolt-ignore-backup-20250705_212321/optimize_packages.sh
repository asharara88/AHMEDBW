#!/bin/bash

echo "📦 OPTIMIZING PACKAGES"
echo "===================="

# Remove duplicate packages
echo "Deduplicating packages..."
npm dedupe

# List large packages
echo ""
echo "Large packages in node_modules:"
du -sh node_modules/* 2>/dev/null | sort -hr | head -10

# Suggest alternatives
echo ""
echo "💡 Consider these optimizations:"
echo "- Replace moment.js with date-fns or dayjs"
echo "- Replace lodash with lodash-es or native methods"
echo "- Use dynamic imports for large libraries"
echo "- Remove unused dependencies"
