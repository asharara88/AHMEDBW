#!/bin/bash

echo "🔄 SYNCING LOCAL WITH REMOTE"
echo "==========================="

# Make sure we're on main
git checkout main

# Fetch all remote changes
git fetch origin

# Check for conflicts
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
BASE=$(git merge-base HEAD origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ Already in sync with remote"
elif [ "$LOCAL" = "$BASE" ]; then
    echo "⬇️  Pulling remote changes..."
    git pull origin main
elif [ "$REMOTE" = "$BASE" ]; then
    echo "⬆️  Pushing local changes..."
    git push origin main
else
    echo "🔀 Branches have diverged - merging..."
    git pull origin main --no-rebase
    
    # If there are conflicts, resolve them
    if [ $? -ne 0 ]; then
        echo "⚠️  Conflicts detected - auto-resolving..."
        
        # Auto-resolve conflicts by keeping our version
        git status --porcelain | grep "^UU" | while read status file; do
            echo "Resolving conflict in: $file"
            git checkout --ours "$file"
            git add "$file"
        done
        
        git commit -m "🔀 MERGE: Resolve conflicts with remote main"
    fi
    
    echo "⬆️  Pushing merged changes..."
    git push origin main
fi

echo "✅ Sync complete!"
