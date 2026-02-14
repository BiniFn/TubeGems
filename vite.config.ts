import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: '.', // Explicitly set root to current directory
    plugins: [react()],
    base: '/', // Use absolute paths for assets
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "AIzaSyDXWXBZDkso_A6ju7MJmWQ89Cu6ejVtC4I")
    }
  };
});