#!/bin/bash

echo "📝 CREATING PULL REQUESTS ON GITHUB"
echo "=================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it first:"
    echo "   brew install gh"
    echo "   Or visit: https://cli.github.com/"
    exit 1
fi

# Login to GitHub (if not already logged in)
gh auth status || gh auth login

# Create PRs for each feature branch
echo "1️⃣ Creating PR for Bolt Optimization..."
gh pr create \
  --base main \
  --head feature/bolt-optimization \
  --title "🛡️ Add Bolt Optimization and File Protection" \
  --body "## 🎯 Purpose
Prevent Bolt from removing important files by adding comprehensive ignore patterns and configuration.

## 📋 Changes
- Added .boltignore file with comprehensive patterns
- Created bolt.config.json for configuration
- Optimized project structure for Bolt workflow
- Protected source code and configuration files

## 🧪 Testing
- [x] Verified .boltignore patterns work
- [x] Tested with Bolt workflow
- [x] Confirmed no important files are removed

## 📊 Impact
- Prevents accidental file deletion by Bolt
- Reduces project size calculation
- Improves Bolt performance
- Maintains code integrity

Ready for review! 🚀"

echo "2️⃣ Creating PR for Unused Variable Fixes..."
gh pr create \
  --base main \
  --head fix/unused-variables \
  --title "🔧 Fix Unused 'data' Variables Across Codebase" \
  --body "## 🐛 Problem
Multiple TypeScript compilation warnings due to unused 'data' variables in destructuring assignments.

## 🛠️ Solution
- Removed unused 'data' variables from destructuring
- Fixed ImportSupplementsPage unused variable
- Fixed supabaseClient unused variable
- Cleaned up import statements

## 📋 Changes
- Fixed all 'variable declared but never used' warnings
- Improved code quality and TypeScript compliance
- Cleaned up destructuring patterns

## 🧪 Testing
- [x] TypeScript compilation passes
- [x] No unused variable warnings
- [x] All functionality preserved
- [x] Build process verified

Ready for merge! ✅"

echo "3️⃣ Creating PR for Enhanced Onboarding..."
gh pr create \
  --base main \
  --head feature/enhanced-onboarding \
  --title "✨ Add Enhanced Onboarding System" \
  --body "## 🚀 Feature
Comprehensive onboarding system to personalize user health journey.

## 📋 Features Added
- 5-step onboarding flow
- Personal information collection
- Health goals assessment
- Lifestyle questionnaire
- Supplement preferences
- Progress tracking with animations
- Responsive design
- Form validation and error handling

## 🎯 Benefits
- Improves user experience
- Personalizes health recommendations
- Increases user engagement
- Collects valuable user data

## 🧪 Testing
- [x] All onboarding steps work
- [x] Form validation functions
- [x] Responsive design verified
- [x] Animations smooth
- [x] Data persistence works

Ready for review! 🎉"

echo "4️⃣ Creating PR for Deployment Scripts..."
gh pr create \
  --base main \
  --head feature/deployment-scripts \
  --title "🚀 Add Deployment and Maintenance Scripts" \
  --body "## 🛠️ Purpose
Add comprehensive deployment and maintenance automation scripts.

## 📋 Scripts Added
- Complete deployment automation
- Branch cleanup utilities
- Project analysis tools
- Conflict resolution automation
- Size optimization scripts

## 🎯 Benefits
- Streamlines deployment process
- Automates routine maintenance
- Reduces manual errors
- Improves developer productivity

## 🧪 Testing
- [x] All scripts execute successfully
- [x] Deployment process verified
- [x] Cleanup functions work
- [x] No breaking changes

Ready for review! 🔧"

echo "5️⃣ Creating PR for Project Cleanup..."
gh pr create \
  --base main \
  --head chore/project-cleanup \
  --title "🧹 Add Project Cleanup and Optimization Tools" \
  --body "## 🎯 Purpose
Add tools for project analysis, cleanup, and optimization.

## 📋 Tools Added
- Project size analysis
- Automated cleanup scripts
- Package optimization utilities
- File structure analysis
- Performance monitoring

## 🎯 Benefits
- Maintains project health
- Identifies optimization opportunities
- Automates routine cleanup
- Provides project insights

## 🧪 Testing
- [x] Analysis tools work correctly
- [x] Cleanup scripts safe to run
- [x] Optimization suggestions accurate
- [x] No data loss

Ready for review! 📊"

echo ""
echo "✅ All pull requests created!"
echo ""
echo "🔗 Next steps:"
echo "1. Go to GitHub and review the PRs"
echo "2. Add any additional reviewers"
echo "3. Address any feedback"
echo "4. Merge when ready"
echo ""
echo "📋 PRs created:"
echo "- Bolt Optimization"
echo "- Unused Variable Fixes"
echo "- Enhanced Onboarding"
echo "- Deployment Scripts"
echo "- Project Cleanup"
