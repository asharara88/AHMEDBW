#!/bin/bash

echo "🔄 Starting merge to main process..."

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if we have uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Committing uncommitted changes..."
    git add .
    git commit -m "auto: Save changes before merge to main ($(date))"
fi

# If not on main, switch to main
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Switching to main branch..."
    git checkout main
    
    # Pull latest main
    echo "⬇️ Pulling latest main..."
    git pull origin main
    
    # Merge feature branch
    echo "🔀 Merging $CURRENT_BRANCH into main..."
    git merge $CURRENT_BRANCH
else
    echo "📍 Already on main branch"
    # Pull any remote changes
    git pull origin main
fi

# Push to remote main
echo "⬆️ Pushing to remote main..."
git push origin main

echo ""
echo "🎉 Successfully merged to main!"
echo "✅ Local main updated"
echo "✅ Remote main updated"
echo "✅ All changes synchronized"

# Show recent commits
echo ""
echo "📊 Recent commits on main:"
git log --oneline -5
