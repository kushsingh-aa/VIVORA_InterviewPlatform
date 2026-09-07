import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/interview': 'http://localhost:5000',
      '/skill': 'http://localhost:5000',
      '/opportunity': 'http://localhost:5000',
      '/analytics': 'http://localhost:5000',
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
