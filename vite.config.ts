import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    define: {
      // Inject the API key from the environment variable at build time.
      // Falls back to the hardcoded string ONLY if the env var is missing (for local dev convenience if .env is missing)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "AIzaSyDXWXBZDkso_A6ju7MJmWQ89Cu6ejVtC4I")
    }
  };
});