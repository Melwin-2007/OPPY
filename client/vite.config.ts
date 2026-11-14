import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.usdz'],
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1600
  }
});
