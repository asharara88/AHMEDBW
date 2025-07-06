#!/bin/bash

echo "🔀 MERGING IMPORTANT WORK"
echo "========================"

# Switch to main
git checkout main
git pull origin main

# Create a new branch for consolidated work
git checkout -b feature/consolidated-codex-fixes

# Cherry-pick important commits from codex branches
echo "🍒 Cherry-picking important fixes..."

# CORS fixes
git cherry-pick origin/codex/fix-cors-policy-conflict 2>/dev/null || echo "Skipping CORS conflict fix"
git cherry-pick origin/codex/fix-cors-policy-issue 2>/dev/null || echo "Skipping CORS issue fix"

# Config fixes
git cherry-pick origin/codex/fix-config-parsing-errors 2>/dev/null || echo "Skipping config parsing fix"

# Environment setup
git cherry-pick origin/codex/add-environment-config-for-openai-api-key 2>/dev/null || echo "Skipping OpenAI config"

# Database configuration
git cherry-pick origin/codex/configure-database-url-for-postgresql 2>/dev/null || echo "Skipping PostgreSQL config"

echo "✅ Important work consolidated into feature/consolidated-codex-fixes"
echo ""
echo "Next steps:"
echo "1. Review the consolidated branch"
echo "2. Test the changes"
echo "3. Push and create a PR"
