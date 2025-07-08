#!/bin/bash

echo "🔧 RESTORING MISSING ESSENTIAL FILES"
echo "===================================="

MISSING_FILES=()

# Check and create missing files
echo "1️⃣ Checking core files..."

# src/main.tsx
if [ ! -f "src/main.tsx" ]; then
    echo "❌ Creating missing src/main.tsx"
    mkdir -p src
    cat > src/main.tsx << 'MAIN_EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
MAIN_EOF
    MISSING_FILES+=("src/main.tsx")
fi

# src/App.tsx
if [ ! -f "src/App.tsx" ]; then
    echo "❌ Creating missing src/App.tsx"
    cat > src/App.tsx << 'APP_EOF'
import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-2xl">🩺</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            BioWell
          </h1>
          <p className="text-xl text-gray-600 mb-2">Your Personal Health Dashboard</p>
          <div className="text-lg text-gray-500">
            {currentTime.toLocaleString()}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Health Score</h2>
            <div className="text-3xl font-bold text-green-600">85%</div>
            <p className="text-gray-600">Overall wellness</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Daily Goals</h2>
            <div className="text-3xl font-bold text-blue-600">4/5</div>
            <p className="text-gray-600">Tasks completed</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Streak</h2>
            <div className="text-3xl font-bold text-purple-600">12</div>
            <p className="text-gray-600">Days active</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
APP_EOF
    MISSING_FILES+=("src/App.tsx")
fi

# src/index.css
if [ ! -f "src/index.css" ]; then
    echo "❌ Creating missing src/index.css"
    cat > src/index.css << 'CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}
CSS_EOF
    MISSING_FILES+=("src/index.css")
fi

# index.html
if [ ! -f "index.html" ]; then
    echo "❌ Creating missing index.html"
    cat > index.html << 'HTML_EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BioWell</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML_EOF
    MISSING_FILES+=("index.html")
fi

# vite.config.ts
if [ ! -f "vite.config.ts" ]; then
    echo "❌ Creating missing vite.config.ts"
    cat > vite.config.ts << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
VITE_EOF
    MISSING_FILES+=("vite.config.ts")
fi

# tsconfig.json
if [ ! -f "tsconfig.json" ]; then
    echo "❌ Creating missing tsconfig.json"
    cat > tsconfig.json << 'TS_EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
TS_EOF
    MISSING_FILES+=("tsconfig.json")
fi

# tailwind.config.js
if [ ! -f "tailwind.config.js" ]; then
    echo "❌ Creating missing tailwind.config.js"
    cat > tailwind.config.js << 'TAILWIND_EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
TAILWIND_EOF
    MISSING_FILES+=("tailwind.config.js")
fi

# postcss.config.js
if [ ! -f "postcss.config.js" ]; then
    echo "❌ Creating missing postcss.config.js"
    cat > postcss.config.js << 'POSTCSS_EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS_EOF
    MISSING_FILES+=("postcss.config.js")
fi

# .gitignore
if [ ! -f ".gitignore" ]; then
    echo "❌ Creating missing .gitignore"
    cat > .gitignore << 'GITIGNORE_EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build outputs
dist/
dist-ssr/
build/
*.local

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage directory
coverage/

# Temporary folders
tmp/
temp/
GITIGNORE_EOF
    MISSING_FILES+=(".gitignore")
fi

echo ""
echo "2️⃣ Summary of restored files:"
if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ No missing files found!"
else
    echo "🔧 Restored ${#MISSING_FILES[@]} missing files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   ✅ $file"
    done
fi

echo ""
echo "3️⃣ Testing if project builds..."
npm install --silent
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Project builds successfully after restoration!"
else
    echo "❌ Project still has build issues"
fi

echo ""
echo "🎯 MISSING FILES RESTORATION COMPLETE!"
