import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH lets the same build live under a sub-path (e.g. GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    sourcemap: false,
  },
  server: { port: 5173, open: false },
  preview: { port: 4173 },
});
