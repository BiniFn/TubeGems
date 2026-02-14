import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' ensures assets are linked relatively.
  // This solves the "black screen" issue on GitHub Pages subdirectories (e.g. /TubeGems/)
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  define: {
    // Inject the API key directly into the build. 
    // WARNING: This makes the key visible in the browser sources.
    // Ensure you have restricted this key to your specific domains in Google Cloud Console.
    'process.env.API_KEY': JSON.stringify("AIzaSyDXWXBZDkso_A6ju7MJmWQ89Cu6ejVtC4I")
  }
});