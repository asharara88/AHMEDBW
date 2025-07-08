#!/bin/bash

echo "🎨 INSTALLING TAILWIND CSS COMPLETELY"
echo "====================================="

# 1. Install Tailwind CSS and dependencies
echo "1️⃣ Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Tailwind dependencies"
    exit 1
fi

# 2. Initialize Tailwind
echo "2️⃣ Initializing Tailwind configuration..."
npx tailwindcss init -p

# 3. Create proper tailwind.config.js
echo "3️⃣ Creating Tailwind configuration..."
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

# 4. Create postcss.config.js
echo "4️⃣ Creating PostCSS configuration..."
cat > postcss.config.js << 'POSTCSS_EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS_EOF

# 5. Update src/index.css with Tailwind directives
echo "5️⃣ Updating CSS with Tailwind directives..."
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

# 6. Test build
echo "6️⃣ Testing build with Tailwind..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ TAILWIND INSTALLATION SUCCESSFUL!"
    echo "🎨 All Tailwind classes should now work"
    echo "📊 Build size: $(du -sh dist 2>/dev/null || echo 'Unknown')"
else
    echo "❌ Build failed after Tailwind installation"
    echo "🔍 Check for configuration errors"
fi

echo ""
echo "🎯 TAILWIND INSTALLATION COMPLETE!"
echo "=================================="
echo "✅ Tailwind CSS installed"
echo "✅ Configuration files created"
echo "✅ CSS directives added"
echo "✅ Build system updated"
