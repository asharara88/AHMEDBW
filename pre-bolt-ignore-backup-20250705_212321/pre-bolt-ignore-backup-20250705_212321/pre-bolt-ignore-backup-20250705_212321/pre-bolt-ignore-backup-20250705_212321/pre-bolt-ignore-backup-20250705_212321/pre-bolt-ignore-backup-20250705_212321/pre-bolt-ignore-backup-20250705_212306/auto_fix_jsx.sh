#!/bin/bash

echo "🤖 AUTOMATED JSX FIX"
echo "==================="

# Check if we can auto-fix the JSX structure
FILE="src/components/layout/Layout.tsx"

# Count opening and closing TabsContent tags
OPENING_TAGS=$(grep -o "<TabsContent" "$FILE" | wc -l)
CLOSING_TAGS=$(grep -o "</TabsContent>" "$FILE" | wc -l)

echo "Opening <TabsContent> tags: $OPENING_TAGS"
echo "Closing </TabsContent> tags: $CLOSING_TAGS"

if [ "$OPENING_TAGS" -ne "$CLOSING_TAGS" ]; then
    echo "⚠️  Mismatch detected! Need to fix JSX structure"
    echo "Please manually add the missing </TabsContent> tag(s)"
    
    # Show the TabsContent structure
    echo ""
    echo "📋 TabsContent structure in the file:"
    grep -n -A 2 -B 2 "TabsContent" "$FILE"
else
    echo "✅ TabsContent tags are balanced"
fi
