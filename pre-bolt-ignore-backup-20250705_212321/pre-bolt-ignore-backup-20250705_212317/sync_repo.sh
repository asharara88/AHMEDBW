#!/bin/bash

echo "🔄 Starting repository sync..."

# Check if we have uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Found uncommitted changes, committing..."
    git add .
    git commit -m "auto: Save changes before sync ($(date))"
fi

# Fetch remote changes
echo "📡 Fetching remote changes..."
git fetch origin

# Check if we're behind
BEHIND=$(git rev-list --count HEAD..origin/main)
AHEAD=$(git rev-list --count origin/main..HEAD)

echo "📊 Sync status:"
echo "   Local commits ahead: $AHEAD"
echo "   Remote commits behind: $BEHIND"

if [ $BEHIND -gt 0 ]; then
    echo "⬇️  Pulling remote changes..."
    git pull origin main
fi

if [ $AHEAD -gt 0 ]; then
    echo "⬆️  Pushing local changes..."
    git push origin main
fi

echo "✅ Repository sync complete!"
git log --oneline -3
