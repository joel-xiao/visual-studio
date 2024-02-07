import path from 'path';
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from 'vite-plugin-vue-devtools';
import viteCompression from 'vite-plugin-compression';
import copyPlugin from 'rollup-plugin-copy';

// https://vitejs.dev/config/
export default defineConfig(async () => {
  let copyPluginTargets = [];
  const isTauriBuild = process.argv.includes('build') && process.argv.includes('dist-tauri');
  if (!isTauriBuild) copyPluginTargets = [{ src: 'apps/*', dest: 'dist/apps' }];

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
        // "layouts": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src/layouts"),
      }
    },

    base: '/',

    build: {
      // minify: 'terser',
      // terserOptions: {
      //   compress: {
      //     drop_console: true,
      //     drop_debugger: true
      //   }
      // }
      emptyOutDir: false,
      rollupOptions: {
        plugins: [
          copyPlugin({
            targets: copyPluginTargets
          })
        ]
      }
    },
  
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },
  }
});
