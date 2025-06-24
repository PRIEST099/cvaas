import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  base: '/',
  server: {
    fs: {
      strict: false
    }
  },
  preview: {
    port: 4173,
    open: true
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
