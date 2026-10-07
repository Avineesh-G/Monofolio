import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  worker: {
    format: 'es'
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/dexie') || id.includes('node_modules/zustand')) {
            return 'vendor-state';
          }
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'vendor-pdf';
          }
          if (id.includes('node_modules/@tanstack/react-virtual')) {
            return 'vendor-virtual';
          }
        }
      }
    }
  }
});
