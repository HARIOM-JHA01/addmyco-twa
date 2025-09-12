import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: './dist',
  },
  base: '/addmyco/',
  server: {
    proxy: {
      '/api': {
        target: 'https://telegramdirectory.org',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});