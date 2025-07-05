#!/bin/bash

echo "📊 ANALYZING BRANCH CONTENT"
echo "=========================="

# Create analysis report
REPORT_FILE="branch_analysis_$(date +%Y%m%d_%H%M%S).txt"

echo "Branch Analysis Report - $(date)" > "$REPORT_FILE"
echo "================================" >> "$REPORT_FILE"

# Analyze each branch
git branch -r | grep -v "HEAD" | sed 's/origin\///' | while read branch; do
    echo ""
    echo "🔍 Analyzing: $branch"
    echo "" >> "$REPORT_FILE"
    echo "Branch: $branch" >> "$REPORT_FILE"
    echo "----------------" >> "$REPORT_FILE"
    
    # Get branch info
    LAST_COMMIT=$(git log -1 --format="%ci" origin/$branch 2>/dev/null || echo "Unknown")
    COMMIT_COUNT=$(git rev-list --count origin/$branch ^origin/main 2>/dev/null || echo "0")
    FILES_CHANGED=$(git diff --name-only origin/main...origin/$branch 2>/dev/null | wc -l || echo "0")
    
    echo "Last commit: $LAST_COMMIT" | tee -a "$REPORT_FILE"
    echo "Commits ahead of main: $COMMIT_COUNT" | tee -a "$REPORT_FILE"
    echo "Files changed: $FILES_CHANGED" | tee -a "$REPORT_FILE"
    
    # Show actual changes
    if [ "$FILES_CHANGED" -gt 0 ]; then
        echo "Changed files:" >> "$REPORT_FILE"
        git diff --name-only origin/main...origin/$branch 2>/dev/null | head -10 >> "$REPORT_FILE"
    fi
done

echo ""
echo "✅ Analysis complete! Report saved to: $REPORT_FILE"
echo ""
echo "📋 Summary of branches with significant changes:"
git branch -r | grep -v "HEAD" | sed 's/origin\///' | while read branch; do
    COMMIT_COUNT=$(git rev-list --count origin/$branch ^origin/main 2>/dev/null || echo "0")
    if [ "$COMMIT_COUNT" -gt 0 ]; then
        echo "  - $branch: $COMMIT_COUNT commits ahead"
    fi
done
