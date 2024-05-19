import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  build: {
    outDir: "build"
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: 'src/setupTests.ts',
  },
});
