/// <reference types="node" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // Optional: tighten build for Amplify
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false
  }
});



