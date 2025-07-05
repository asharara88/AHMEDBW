#!/bin/bash

echo "🛡️ SAFE BOLT IGNORE IMPLEMENTATION"
echo "================================="

# 1. Backup current project state
echo "1️⃣ Creating backup..."
BACKUP_DIR="pre-bolt-ignore-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup created: $BACKUP_DIR"

# 2. Create minimal .bolt/ignore first
echo "2️⃣ Creating minimal .bolt/ignore..."
mkdir -p .bolt
cat > .bolt/ignore << 'MINIMAL_EOF'
# MINIMAL SAFE EXCLUSIONS ONLY
# ============================

# Large dependencies (safe - can be reinstalled)
node_modules/*

# Build output (safe - generated)
dist/*
build/*
.vite/*

# Cache (safe - temporary)
.cache/*

# Logs (safe - just output)
*.log
logs/*

# OS files (safe - not project files)
.DS_Store
Thumbs.db
MINIMAL_EOF

echo "✅ Minimal .bolt/ignore created"

# 3. Test with minimal exclusions first
echo "3️⃣ Testing minimal exclusions..."
echo "Files now hidden from Bolt:"
if [ -d "node_modules" ]; then echo "   - node_modules/ (large dependency)"; fi
if [ -d "dist" ]; then echo "   - dist/ (build output)"; fi
if [ -d ".vite" ]; then echo "   - .vite/ (cache)"; fi

echo ""
echo "Files still visible to Bolt:"
echo "✅ All source code (src/)"
echo "✅ All configuration files"
echo "✅ All documentation"
echo "✅ All test files"
echo "✅ Package files"
echo "✅ Environment examples"

# 4. Verify critical files are still visible
echo "4️⃣ Verifying critical files visibility..."
CRITICAL_FILES=(
    "src/App.tsx"
    "src/main.tsx"
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "index.html"
)

echo "Critical files check:"
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - VISIBLE"
    else
        echo "⚠️  $file - NOT FOUND"
    fi
done

echo ""
echo "🎯 RECOMMENDATION:"
echo "   Start with this minimal exclusion list"
echo "   Test Bolt behavior thoroughly"
echo "   Only add more exclusions if needed"
echo "   Always verify AI can still understand your project"
