import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // keep this exclusion
  },
  build: {
    outDir: 'dist', // required for Vercel/Netlify
    sourcemap: true, // useful for debugging production
  },
  server: {
    port: 3000, // local dev port
  },
});
