import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        // Keep all shared code in one predictable file, no hashed chunks
        chunkFileNames: 'shared.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
