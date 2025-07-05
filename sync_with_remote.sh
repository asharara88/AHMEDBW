#!/bin/bash

echo "🔄 SYNCING WITH REMOTE REPOSITORY"
echo "==============================="

# Fetch all remote changes
git fetch origin

# Check sync status
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
BASE=$(git merge-base HEAD origin/main)

echo "📊 Sync Status:"
echo "Local:  $LOCAL"
echo "Remote: $REMOTE"
echo "Base:   $BASE"

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ Already in sync with remote"
elif [ "$LOCAL" = "$BASE" ]; then
    echo "⬇️  Local is behind remote - pulling changes..."
    git pull origin main
elif [ "$REMOTE" = "$BASE" ]; then
    echo "⬆️  Local is ahead of remote - pushing changes..."
    git push origin main
else
    echo "🔀 Branches have diverged - merging..."
    
    # Pull with merge strategy
    git pull origin main --no-rebase
    
    # Handle conflicts if any
    if [ $? -ne 0 ]; then
        echo "⚠️  Merge conflicts detected - auto-resolving..."
        
        # Auto-resolve conflicts by keeping our version for important files
        git status --porcelain | grep "^UU" | while read status file; do
            echo "Resolving conflict in: $file"
            case "$file" in
                "src/"*|"*.tsx"|"*.ts"|"*.json"|".bolt/ignore")
                    git checkout --ours "$file"
                    ;;
                *)
                    git checkout --theirs "$file"
                    ;;
            esac
            git add "$file"
        done
        
        git commit -m "🔀 MERGE: Resolve conflicts and sync with remote main"
    fi
    
    echo "⬆️  Pushing merged changes..."
    git push origin main
fi

echo "✅ Sync process completed"
