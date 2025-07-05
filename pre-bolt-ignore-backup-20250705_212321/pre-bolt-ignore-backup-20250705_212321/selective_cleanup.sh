#!/bin/bash

echo "🧹 SELECTIVE BRANCH CLEANUP"
echo "=========================="

# Branches that are safe to delete (duplicates, test branches, etc.)
SAFE_TO_DELETE=(
    # Duplicate newline branches
    "0hgtga-codex/add-newline-at-end-of-text-files"
    "1rmj5h-codex/add-newline-at-end-of-text-files"
    "709qle-codex/add-newline-at-end-of-text-files"
    "codex/add-newline-at-end-of-text-files"
    
    # Duplicate environment config branches
    "7u36qz-codex/add-environment-config-for-openai-api-key"
    "asp1ys-codex/add-environment-config-for-openai-api-key"
    
    # Old/superseded branches
    "codex/fix-issue-immediately"
    "codex/locate-and-remove-deviceimages-tsx"
    "codex/remove-unused-supabase-ts-file"
    
    # Codespace branch
    "codespace-sturdy-xylophone-5g5qxx9469ggfvvq"
)

echo "🗑️  Deleting safe-to-remove branches..."
for branch in "${SAFE_TO_DELETE[@]}"; do
    echo "Deleting: $branch"
    git push origin --delete "$branch" 2>/dev/null || echo "  Already deleted"
done

echo "✅ Selective cleanup complete"
echo ""
echo "📋 Remaining branches:"
git branch -r
