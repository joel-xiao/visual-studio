import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import viteCompression from 'vite-plugin-compression';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(async ({ mode }) => {
  const isClientTarget = mode === 'client';
  const isWebMode = mode === 'web';
  const base = isClientTarget ? './' : '/';

  const alias: Record<string, string> = {
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
  };

  // In web mode, replace Tauri API with stub to prevent bundling
  if (isWebMode) {
    alias['@tauri-apps/api/core'] = path.resolve(__dirname, 'src/client/tauri/web-stub.ts');
  }

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
      alias
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
