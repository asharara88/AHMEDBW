import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173, // Run on port 5173 instead of 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: true,
    // Increase the chunk size warning limit temporarily
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'supabase': ['@supabase/supabase-js', '@supabase/auth-helpers-react'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-router-dom', 'framer-motion', 'lucide-react']
  }
});