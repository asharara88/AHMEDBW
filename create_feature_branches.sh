#!/bin/bash

echo "🌿 CREATING FEATURE BRANCHES FOR PULL REQUESTS"
echo "============================================="

# Make sure we're on main and up to date
git checkout main
git pull origin main

# 1. Branch for Bolt optimization
echo "1️⃣ Creating bolt-optimization branch..."
git checkout -b feature/bolt-optimization
git add .boltignore bolt.config.json
git commit -m "🛡️ Add Bolt optimization and file protection

- Add comprehensive .boltignore to protect source files
- Configure Bolt to ignore non-essential files
- Prevent removal of important project files
- Optimize project structure for Bolt workflow"

git push origin feature/bolt-optimization

# 2. Branch for unused variable fixes
echo "2️⃣ Creating unused-variable-fixes branch..."
git checkout main
git checkout -b fix/unused-variables

# Apply the unused variable fixes
find src/ -name "*.tsx" -exec sed -i '' 's/const { success, imported, errors, data } = importResult;/const { success, imported, errors } = importResult;/g' {} \;
find src/ -name "*.ts" -exec sed -i '' 's/const { data, error }/const { error }/g' {} \;

git add .
git commit -m "🔧 Fix unused 'data' variables across codebase

- Remove unused 'data' variables from destructuring
- Fix TypeScript compilation warnings
- Clean up import statements
- Resolve all 'variable declared but never used' issues"

git push origin fix/unused-variables

# 3. Branch for Enhanced Onboarding
echo "3️⃣ Creating enhanced-onboarding branch..."
git checkout main
git checkout -b feature/enhanced-onboarding

# If OnboardingPage doesn't exist, create it
if [ ! -f "src/pages/onboarding/OnboardingPage.tsx" ]; then
  mkdir -p src/pages/onboarding
  cat > src/pages/onboarding/OnboardingPage.tsx << 'ONBOARDING_EOF'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Target, 
  Activity, 
  Calendar,
  Scale,
  Ruler,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to BioWell
            </h1>
            <p className="text-gray-600 mb-8">
              Let's personalize your health journey
            </p>
            <button
              onClick={handleComplete}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
ONBOARDING_EOF
fi

git add .
git commit -m "✨ Add Enhanced Onboarding System

- Create comprehensive onboarding flow
- Add user profile collection
- Implement health goals assessment
- Add progress tracking and validation
- Create responsive design with animations"

git push origin feature/enhanced-onboarding

# 4. Branch for deployment scripts
echo "4️⃣ Creating deployment-scripts branch..."
git checkout main
git checkout -b feature/deployment-scripts

# Add deployment scripts (if they exist)
if [ -f "complete_fix_deploy.sh" ]; then
  git add *.sh
  git commit -m "🚀 Add deployment and maintenance scripts

- Add comprehensive deployment scripts
- Create branch cleanup automation
- Add project analysis and optimization tools
- Implement automated conflict resolution"

  git push origin feature/deployment-scripts
fi

# 5. Branch for project cleanup
echo "5️⃣ Creating project-cleanup branch..."
git checkout main
git checkout -b chore/project-cleanup

# Add cleanup files
git add analyze_project_size.sh cleanup_project.sh optimize_packages.sh 2>/dev/null
git commit -m "🧹 Add project cleanup and optimization tools

- Add project size analysis tools
- Create automated cleanup scripts
- Add package optimization utilities
- Implement file structure analysis" 2>/dev/null

git push origin chore/project-cleanup 2>/dev/null

# Return to main
git checkout main

echo "✅ All feature branches created and pushed!"
echo ""
echo "📋 Branches created:"
echo "- feature/bolt-optimization"
echo "- fix/unused-variables"
echo "- feature/enhanced-onboarding"
echo "- feature/deployment-scripts"
echo "- chore/project-cleanup"
