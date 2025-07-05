#!/bin/bash

echo "💾 BACKING UP IMPORTANT BRANCHES"
echo "==============================="

# Create backup directory
BACKUP_DIR="branch_backups_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# List of branches to backup based on their importance
IMPORTANT_BRANCHES=(
    "codex/fix-cors-policy-conflict"
    "codex/fix-cors-policy-issue"
    "codex/fix-config-parsing-errors"
    "codex/add-environment-config-for-openai-api-key"
    "codex/configure-database-url-for-postgresql"
    "codex/implement-comprehensive-error-logging"
    "codex/evaluate-and-update-jwt-verification-for-chat-assistant"
    "codex/fix-infinite-request-loop-in-onboarding"
)

for branch in "${IMPORTANT_BRANCHES[@]}"; do
    echo "Backing up: $branch"
    
    # Create patch file
    git format-patch origin/main..origin/$branch -o "$BACKUP_DIR" --stdout > "$BACKUP_DIR/${branch//\//_}.patch" 2>/dev/null
    
    # Save branch info
    echo "Branch: $branch" >> "$BACKUP_DIR/branch_info.txt"
    git log --oneline origin/main..origin/$branch >> "$BACKUP_DIR/branch_info.txt" 2>/dev/null
    echo "---" >> "$BACKUP_DIR/branch_info.txt"
done

echo "✅ Backups saved to: $BACKUP_DIR"
