import path from 'path';
import { defineConfig, Plugin } from 'vite';
import viteCompression from 'vite-plugin-compression';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
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
      // "layouts": path.resolve(__dirname, "src/layouts"),
    }
  },
  define: {
    'process.env': {}
  },
  base: './',
  build: {
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true
    //   }
    // }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4523/mock/867399',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
