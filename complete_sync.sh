#!/bin/bash

echo "🚀 EXECUTING COMPLETE BOLT OPTIMIZATION AND SYNC"
echo "=============================================="

# 1. Apply strategic implementation
./safe_bolt_implementation.sh

# 2. Add and commit all changes
git add .
git commit -m "🛡️ Add strategic Bolt context optimization

✅ FEATURES:
- Conservative .bolt/ignore implementation
- Optimized context window
- Protected critical files
- Maintained project awareness

🎯 EXCLUSIONS:
- node_modules/ (dependencies)
- dist/ build/ .vite/ (build artifacts)
- *.log logs/ (log files)
- .DS_Store Thumbs.db (OS files)
- .cache/ (cache files)

🛡️ PRESERVED:
- All source code (src/)
- All configuration files
- All documentation
- All test files
- Package management files"

# 3. Sync with remote
git fetch origin
git pull origin main
git push origin main

# 4. Verify
git fetch origin
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ]; then
    echo "🎉 SUCCESS: Bolt optimization applied and synced!"
else
    echo "⚠️  Sync incomplete - manual intervention may be needed"
fi
