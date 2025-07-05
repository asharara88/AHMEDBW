#!/bin/bash

echo "🔒 CLOSING PULL REQUESTS"
echo "======================="

if command -v gh &> /dev/null; then
    echo "📋 Closing open pull requests..."
    
    # List and close all open PRs
    gh pr list --state open --json number,title | jq -r '.[] | "\(.number) \(.title)"' | while read pr_number title; do
        echo "🔒 Closing PR #$pr_number: $title"
        gh pr close "$pr_number" --comment "🔄 Changes have been consolidated and merged directly to main branch. All features from this PR are now included in the main branch."
    done
    
    echo "✅ All pull requests closed"
else
    echo "⚠️  GitHub CLI not available"
    echo "📋 Manual action required:"
    echo "   Go to https://github.com/asharara88/AHMEDBW/pulls"
    echo "   Close all open pull requests"
    echo "   Add comment: 'Changes consolidated and merged to main'"
fi
