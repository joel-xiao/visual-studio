import path from 'path';
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from 'vite-plugin-vue-devtools';
import viteCompression from 'vite-plugin-compression';
import copyPlugin from 'rollup-plugin-copy';

export default defineConfig(async ({ mode }) => {
  let copyPluginTargets = [];
  const isTauriBuild = process.argv.includes('build') && process.argv.includes('dist-tauri');
  if (!isTauriBuild) copyPluginTargets = [{ src: 'apps/*', dest: 'dist/apps' }];

  let buildTarget = mode && ['electron', 'tauri', 'web'].includes(mode) ? mode : 'web';
  
  const targetIndex = process.argv.indexOf('--target');
  if (targetIndex !== -1 && process.argv[targetIndex + 1]) {
    const target = process.argv[targetIndex + 1];
    if (['electron', 'tauri', 'web'].includes(target)) {
      buildTarget = target;
    }
  }

  if (isTauriBuild) {
    buildTarget = 'tauri';
  }

  const base = (buildTarget === 'electron' || buildTarget === 'tauri') ? './' : '/';

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
        '@p': path.resolve(__dirname, 'src/plugins'),
        '@d': path.resolve(__dirname, 'src/directives'),
        '@hooks': path.resolve(__dirname, 'src/hooks')
      }
    },

    base: base,

    build: {
      emptyOutDir: false,
      rollupOptions: {
        plugins: [
          copyPlugin({
            targets: copyPluginTargets
          })
        ]
      }
    },
  
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  }
});
