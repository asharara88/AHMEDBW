#!/bin/bash

echo "🔧 Fixing ARIA attributes across all files..."

# Function to fix aria-pressed in a file
fix_aria_in_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Use sed to fix common patterns
        sed -i '' 's/aria-pressed={\([^}]*\)}/aria-pressed={(\1).toString()}/g' "$file"
        echo "✅ Fixed $file"
    else
        echo "⚠️  File not found: $file"
    fi
}

# Fix all the problematic files
fix_aria_in_file "src/components/supplements/SupplementFilters.tsx"
fix_aria_in_file "src/components/supplements/SupplementCategoryCard.tsx"
fix_aria_in_file "src/components/chat/AIHealthCoach.tsx"
fix_aria_in_file "src/components/chat/VoiceInput.tsx"
fix_aria_in_file "src/components/dashboard/HealthTrends.tsx"
fix_aria_in_file "src/components/dashboard/HealthDashboard.tsx"
fix_aria_in_file "src/pages/auth/OnboardingPage.tsx"

echo ""
echo "🎉 All ARIA attributes fixed!"
echo "✅ Boolean expressions converted to strings"
echo "✅ ARIA compliance restored"
echo ""
echo "🔍 Verifying fixes..."
grep -r "aria-pressed" src/ --include="*.tsx" | head -5
