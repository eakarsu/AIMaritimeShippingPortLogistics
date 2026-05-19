import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_PORT = process.env.BACKEND_PORT || 3001;
const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || 3000);

export default defineConfig({
  plugins: [react()],
  server: {
    port: FRONTEND_PORT,
    proxy: {
      '/api': `http://localhost:${BACKEND_PORT}`
    }
  }
});
