#!/bin/bash

echo "🔧 FIXING SYNC ISSUE"
echo "==================="

# 1. Fetch latest remote changes
echo "1️⃣ Fetching remote changes..."
git fetch origin

# 2. Check the situation
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
echo "Local commit:  $LOCAL"
echo "Remote commit: $REMOTE"

# 3. Force sync by pulling first, then pushing
echo "2️⃣ Pulling remote changes first..."
git pull origin main --no-rebase

# 4. If there are conflicts, resolve them
if [ $? -ne 0 ]; then
    echo "⚠️  Merge conflicts detected - resolving..."
    
    # Auto-resolve conflicts by keeping our version for source files
    git status --porcelain | grep "^UU" | while read status file; do
        echo "Resolving conflict in: $file"
        case "$file" in
            "src/"*|"*.tsx"|"*.ts"|"*.json")
                git checkout --ours "$file"
                ;;
            *)
                git checkout --theirs "$file"
                ;;
        esac
        git add "$file"
    done
    
    # Complete the merge
    git commit -m "🔀 MERGE: Resolve conflicts and sync with remote"
fi

# 5. Now push
echo "3️⃣ Pushing to remote..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Push successful!"
else
    echo "❌ Push failed again - trying force push with lease..."
    git push origin main --force-with-lease
fi

# 6. Verify sync
echo "4️⃣ Verifying sync..."
git fetch origin
LOCAL_AFTER=$(git rev-parse HEAD)
REMOTE_AFTER=$(git rev-parse origin/main)

if [ "$LOCAL_AFTER" = "$REMOTE_AFTER" ]; then
    echo "✅ PERFECT SYNC ACHIEVED!"
else
    echo "❌ Still not synced - need manual intervention"
fi
