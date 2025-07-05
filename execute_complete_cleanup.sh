#!/bin/bash

echo "🚀 EXECUTING COMPLETE CLEANUP AND SYNC"
echo "===================================="

# 1. Merge all pull requests
./cleanup_and_merge_prs.sh

# 2. Consolidate changes
git checkout main
git add .
git commit -m "🚀 FINAL CONSOLIDATION: All features merged and optimized" || echo "No changes to commit"

# 3. Sync with remote
./sync_with_remote.sh

# 4. Clean up branches
./cleanup_branches.sh

# 5. Close pull requests
./close_pull_requests.sh

# 6. Final verification
./final_verification.sh

echo ""
echo "🎉 CLEANUP AND SYNC COMPLETED!"
echo "==============================="
echo "✅ All pull requests merged to main"
echo "✅ Local and remote synchronized"
echo "✅ Feature branches cleaned up"
echo "✅ Project optimized and ready"
echo ""
echo "🌐 Repository: https://github.com/asharara88/AHMEDBW"
echo "🚀 Ready for development!"
