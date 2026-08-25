import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.VITE_GOOGLE_GENAI_API_KEY': JSON.stringify(env.VITE_GOOGLE_GENAI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Security: Restrict to localhost in development
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
      port: parseInt(process.env.SERVER_PORT || '3000'),
      
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify – file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      
      // Security: Disable source maps in production
      sourcemap: process.env.NODE_ENV !== 'production',
    },
    
    build: {
      // Security: Disable source maps in production
      sourcemap: false,
      
      // Ensure minification is enabled
      minify: 'terser',
      
      // Optimize chunk sizes
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': ['firebase'],
            'ui-vendor': ['lucide-react', 'motion'],
          },
        },
      },
    },
  };
});
