#!/bin/bash

echo "🚨 EMERGENCY GIT RESET - GITIGNORE DISASTER"
echo "==========================================="

# Backup current work
echo "1️⃣ Creating backup..."
cp -r . ../biowell-emergency-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Show the disaster
echo ""
echo "2️⃣ Current disaster status:"
echo "Total files tracked: $(git ls-files | wc -l)"
echo "Total commits: $(git log --oneline | wc -l)"

# Ask for confirmation
echo ""
echo "3️⃣ This will:"
echo "   - Delete ALL Git history"
echo "   - Create fresh .gitignore"
echo "   - Start with clean commit"
echo "   - Preserve all your code"
echo ""
read -p "Continue with nuclear reset? (y/N): " choice

if [[ $choice == [Yy]* ]]; then
    echo ""
    echo "💥 EXECUTING NUCLEAR RESET..."
    
    # Remove .git completely
    rm -rf .git
    
    # Create .gitignore first
    cat > .gitignore << 'GITIGNORE_EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.local

# Environment files
.env*

# IDE files
.vscode/
.idea/
*.swp
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Temporary folders
tmp/
temp/
GITIGNORE_EOF
    
    # Initialize fresh Git
    git init
    git branch -M main
    
    # Add only the files we want
    git add .gitignore
    git add src/
    git add public/ 2>/dev/null || true
    git add *.json
    git add *.ts
    git add *.js
    git add *.html
    git add *.md 2>/dev/null || true
    
    # Create clean commit
    git commit -m "🔄 EMERGENCY RESET: Fixed .gitignore disaster

✅ CLEAN SLATE:
- Recreated .gitignore properly
- Removed node_modules from tracking
- Removed build files from tracking
- Clean Git history
- All source code preserved

🎯 BIOWELL APP:
- React TypeScript health dashboard
- Working build system
- Proper Git setup
- Ready for development"
    
    echo ""
    echo "✅ NUCLEAR RESET COMPLETE!"
    echo "📊 New status:"
    echo "   Files tracked: $(git ls-files | wc -l)"
    echo "   Total commits: $(git log --oneline | wc -l)"
    echo ""
    echo "🎯 Your BioWell app is saved with clean Git!"
    
else
    echo "❌ Reset cancelled"
fi
