import { defineConfig } from 'electron-vite';
import path from 'path';

export default defineConfig({
  main: {
    // 明确指定输出格式为 CommonJS（解决格式错误）
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        output: {
          format: 'cjs' // 必须指定为 cjs 或 es
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

