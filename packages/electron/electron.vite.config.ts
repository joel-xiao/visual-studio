import { defineConfig } from 'electron-vite';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        output: {
          format: 'cjs'
        },
        input: path.resolve(__dirname, 'src/main/index.ts')
      }
    },
    resolve: {
      alias: {
        '@main': path.resolve(__dirname, 'src/main')
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: path.resolve(__dirname, 'src/preload/index.ts')
      }
    }
  }
});
