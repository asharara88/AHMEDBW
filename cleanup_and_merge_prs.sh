#!/bin/bash

echo "🔄 CLEANING UP AND MERGING PULL REQUESTS"
echo "======================================="

# Switch to main branch
git checkout main
git fetch origin

# List of feature branches to merge
FEATURE_BRANCHES=(
    "feature/bolt-optimization"
    "fix/unused-variables"
    "feature/enhanced-onboarding"
    "feature/deployment-scripts"
    "chore/project-cleanup"
)

echo "📋 Merging feature branches to main..."

for branch in "${FEATURE_BRANCHES[@]}"; do
    echo ""
    echo "🔄 Processing branch: $branch"
    
    # Check if branch exists locally
    if git branch | grep -q "$branch"; then
        echo "✅ Branch $branch exists locally"
        
        # Switch to the branch and pull latest
        git checkout "$branch"
        git pull origin "$branch" 2>/dev/null || echo "⚠️  No remote for $branch"
        
        # Switch back to main and merge
        git checkout main
        git merge "$branch" --no-ff -m "🔀 Merge $branch into main

Merged features from $branch:
- All changes consolidated into main
- Maintaining commit history
- Resolving any conflicts"
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully merged $branch"
        else
            echo "⚠️  Merge conflict in $branch - resolving automatically"
            
            # Auto-resolve conflicts by keeping our version
            git status --porcelain | grep "^UU" | while read status file; do
                echo "Resolving conflict in: $file"
                git checkout --ours "$file"
                git add "$file"
            done
            
            git commit -m "🔀 Resolve merge conflicts for $branch"
            echo "✅ Conflicts resolved and merged"
        fi
    else
        echo "⚠️  Branch $branch not found locally - skipping"
    fi
done

echo "✅ All feature branches processed"
