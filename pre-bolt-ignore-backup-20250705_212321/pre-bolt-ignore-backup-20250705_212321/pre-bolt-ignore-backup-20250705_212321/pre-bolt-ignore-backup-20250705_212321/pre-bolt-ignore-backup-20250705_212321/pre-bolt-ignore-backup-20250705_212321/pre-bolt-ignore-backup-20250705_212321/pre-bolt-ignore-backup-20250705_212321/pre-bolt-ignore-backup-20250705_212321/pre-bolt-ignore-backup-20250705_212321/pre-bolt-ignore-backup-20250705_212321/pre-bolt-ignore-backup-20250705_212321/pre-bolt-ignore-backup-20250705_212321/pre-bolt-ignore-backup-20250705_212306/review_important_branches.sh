#!/bin/bash

echo "🔍 REVIEWING IMPORTANT BRANCHES"
echo "=============================="

# Branches that look important based on their names
IMPORTANT_PATTERNS=(
    "fix-cors"
    "fix-config"
    "add-environment"
    "configure-database"
    "implement-comprehensive"
    "evaluate-and-update"
)

echo "📋 Potentially important branches:"
for pattern in "${IMPORTANT_PATTERNS[@]}"; do
    git branch -r | grep "$pattern" | while read branch; do
        echo ""
        echo "Branch: $branch"
        echo "Purpose: $(echo $branch | sed 's/.*\///' | sed 's/-/ /g')"
        
        # Show recent commits
        echo "Recent commits:"
        git log --oneline -5 $branch 2>/dev/null | head -5
        
        # Show diff summary
        echo "Changes:"
        git diff --stat origin/main...$branch 2>/dev/null | tail -1
    done
done
