#!/bin/bash

echo "🧹 CLEANING UP FEATURE BRANCHES"
echo "============================="

# Ensure we're on main
git checkout main

# List of branches to clean up
BRANCHES_TO_DELETE=(
    "feature/bolt-optimization"
    "fix/unused-variables"
    "feature/enhanced-onboarding"
    "feature/deployment-scripts"
    "chore/project-cleanup"
    "backup-before-consolidation"
)

echo "🗑️  Deleting merged feature branches..."

for branch in "${BRANCHES_TO_DELETE[@]}"; do
    # Delete local branch
    if git branch | grep -q "$branch"; then
        git branch -d "$branch" 2>/dev/null || git branch -D "$branch"
        echo "✅ Deleted local branch: $branch"
    fi
    
    # Delete remote branch
    git push origin --delete "$branch" 2>/dev/null || echo "⚠️  Remote branch $branch not found"
done

# Clean up remote tracking branches
echo "🧹 Cleaning up remote tracking branches..."
git remote prune origin

echo "✅ Branch cleanup completed"
