#!/bin/bash

echo "⚡ OPTIMIZING BUILD FOR PRODUCTION"
echo "================================="

# 1. Update package.json scripts if needed
echo "1️⃣ Optimizing package.json..."
if ! grep -q "preview" package.json; then
    # Add preview script if not exists
    npm pkg set scripts.preview="vite preview"
fi

# 2. Create/update vite.config.ts for production
echo "2️⃣ Optimizing Vite configuration..."
cat > vite.config.ts << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
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

# 3. Create production build
echo "3️⃣ Creating optimized production build..."
npm run build

# 4. Analyze build size
echo "4️⃣ Analyzing build size..."
if [ -d "dist" ]; then
    echo "📊 Build Analysis:"
    echo "Total size: $(du -sh dist)"
    echo "File breakdown:"
    find dist -type f -name "*.js" -o -name "*.css" -o -name "*.html" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  $size - $(basename "$file")"
    done
fi

echo "✅ Production build optimized!"
