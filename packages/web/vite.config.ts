import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import viteCompression from 'vite-plugin-compression';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(async ({ mode }) => {
  const isClientTarget = mode === 'client';
  const base = isClientTarget ? './' : '/';

  return {
    plugins: [
      vue(),
      VueDevTools(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz'
      }),
      viteStaticCopy({
        targets: [
          {
            src: 'apps/*',
            dest: 'apps'
          }
        ]
      })
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@v': path.resolve(__dirname, 'src/views'),
        '@c': path.resolve(__dirname, 'src/components'),
        '@u': path.resolve(__dirname, 'src/utils'),
        '@a': path.resolve(__dirname, 'src/assets'),
        '@s': path.resolve(__dirname, 'src/service'),
        '@api': path.resolve(__dirname, 'src/service/api'),
        '@p': path.resolve(__dirname, 'src/plugins'),
        '@d': path.resolve(__dirname, 'src/directives'),
        '@hooks': path.resolve(__dirname, 'src/hooks')
      }
    },

    base: base,

    build: {
      emptyOutDir: false
    },

    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true
    }
  };
});
