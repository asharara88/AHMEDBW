#!/bin/bash

echo "📊 MONITORING BOLT BEHAVIOR"
echo "=========================="

echo "🔍 Files currently hidden from Bolt:"
if [ -f ".bolt/ignore" ]; then
    echo "Hidden patterns:"
    grep -v "^#" .bolt/ignore | grep -v "^$" | sed 's/^/   - /'
else
    echo "   No .bolt/ignore file found"
fi

echo ""
echo "✅ Files still visible to Bolt:"
echo "   Source files: $(find src/ -type f -name "*.ts" -o -name "*.tsx" | wc -l) files"
echo "   Config files: $(ls *.json *.js *.ts 2>/dev/null | wc -l) files"
echo "   Documentation: $(find . -name "README*" -o -name "*.md" | wc -l) files"

echo ""
echo "⚠️  SIGNS OF PROBLEMS:"
echo "   - Bolt doesn't understand project structure"
echo "   - Bolt can't find configuration files"
echo "   - Bolt doesn't know about dependencies"
echo "   - Bolt can't see component relationships"
echo "   - Bolt gives incorrect suggestions"

echo ""
echo "🚨 ROLLBACK PROCEDURE:"
echo "   1. Delete or rename .bolt/ignore"
echo "   2. Test Bolt behavior"
echo "   3. Gradually re-add exclusions"
echo "   4. Use backup: $(ls -d *backup* 2>/dev/null | head -1)"
