#!/bin/bash

echo "🔄 CONSOLIDATING 22 PENDING COMMITS"
echo "=================================="

# Make sure we're on main
git checkout main

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Fetch latest from remote
git fetch origin

# Check if we have pending commits
PENDING_COMMITS=$(git log origin/main..HEAD --oneline | wc -l)
echo "📊 Pending commits: $PENDING_COMMITS"

if [ "$PENDING_COMMITS" -gt 0 ]; then
    echo "🔄 Consolidating commits..."
    
    # Create backup branch
    git checkout -b backup-before-consolidation
    git checkout main
    
    # Soft reset to remote main (keeps all changes staged)
    git reset --soft origin/main
    
    # Create one consolidated commit
    git commit -m "🚀 CONSOLIDATED: Major project improvements and fixes

✅ FEATURES IMPLEMENTED:
- Enhanced Onboarding System (5-step flow)
- Bolt optimization and file protection
- Comprehensive deployment scripts
- Project cleanup and analysis tools

🔧 FIXES APPLIED:
- Resolved unused 'data' variables across codebase
- Fixed TypeScript compilation warnings
- Cleaned up import statements
- Resolved merge conflicts

🛡️ BOLT PROTECTION:
- Added .boltignore for file protection
- Created bolt.config.json configuration
- Optimized project structure
- Prevented accidental file deletion

🚀 DEPLOYMENT IMPROVEMENTS:
- Added automated deployment scripts
- Created branch cleanup utilities
- Implemented project analysis tools
- Added comprehensive monitoring

📊 PROJECT OPTIMIZATION:
- Cleaned up unnecessary files
- Optimized package dependencies
- Reduced project size
- Improved build performance

🎯 RESULT: Complete project overhaul with enhanced functionality"

    echo "✅ Commits consolidated into one!"
else
    echo "✅ No pending commits to consolidate"
fi
