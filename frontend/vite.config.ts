import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  if (!env.VITE_SUPABASE_URL) {
    console.warn(
      'WARNING: VITE_SUPABASE_URL is not set. ' +
      'Supabase client will fail. Check your environment variables.',
    );
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:4000',
          ws: true,
        },
      },
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-leaflet', 'leaflet'],
            ui: ['framer-motion', 'animejs'],
          },
        },
      },
    },
  };
});
