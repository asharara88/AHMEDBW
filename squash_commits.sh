#!/bin/bash

echo "🗜️ SQUASHING ALL COMMITS INTO ONE"
echo "================================="

# Get the first commit
FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
echo "First commit: $FIRST_COMMIT"

# Interactive rebase to squash everything
echo "Starting interactive rebase to squash all commits..."
git rebase -i $FIRST_COMMIT

echo "✅ All commits squashed!"
echo "📊 New commit count: $(git log --oneline | wc -l)"
