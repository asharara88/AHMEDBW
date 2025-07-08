#!/bin/bash

echo "🔧 FIXING TERSER BUILD ERROR"
echo "============================"

# Option 1: Install terser
echo "1️⃣ Installing terser..."
npm install -D terser

if [ $? -eq 0 ]; then
    echo "✅ Terser installed successfully"
    
    # Test build
    echo "2️⃣ Testing build with terser..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ BUILD SUCCESSFUL WITH TERSER!"
        exit 0
    fi
fi

# Option 2: Use esbuild instead of terser
echo "2️⃣ Fallback: Using esbuild instead of terser..."
cat > vite.config.ts << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})
VITE_EOF

echo "✅ Updated vite.config.ts to use esbuild"

# Test build again
echo "3️⃣ Testing build with esbuild..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ BUILD SUCCESSFUL WITH ESBUILD!"
else
    echo "❌ Build still failing"
    exit 1
fi
