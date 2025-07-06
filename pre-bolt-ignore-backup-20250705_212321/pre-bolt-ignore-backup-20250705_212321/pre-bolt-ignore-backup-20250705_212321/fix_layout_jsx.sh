#!/bin/bash

echo "🔧 FIXING LAYOUT.TSX JSX ERROR"
echo "============================="

# Backup the original file
cp src/components/layout/Layout.tsx src/components/layout/Layout.tsx.backup

# The issue is likely a missing </TabsContent> tag
# Let's find where TabsContent opens and ensure it has a proper closing tag

echo "🔍 Analyzing TabsContent tags..."
grep -n "TabsContent" src/components/layout/Layout.tsx

# Check the structure around line 364
echo "📍 Code around the error:"
sed -n '350,380p' src/components/layout/Layout.tsx

echo ""
echo "⚠️  Manual fix needed for JSX structure"
echo "Please check that every <TabsContent> has a matching </TabsContent>"
