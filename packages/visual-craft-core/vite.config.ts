import path from 'path';
import fs from 'node:fs/promises';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command }) => {
  const isServe = command === 'serve';
  return {
    base: isServe ? '/' : './',
    plugins: [
      {
        name: 'visual-craft-core:public-assets',
        enforce: 'pre',
        resolveId(id) {
          if (id === 'virtual:visual-craft-core-public-assets') {
            return '\0virtual:visual-craft-core-public-assets';
          }
          return null;
        },
        async load(id) {
          if (id !== '\0virtual:visual-craft-core-public-assets') return null;

          async function walkFiles(dir: string): Promise<string[]> {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const out: string[] = [];
            for (const e of entries) {
              const abs = path.join(dir, e.name);
              if (e.isDirectory()) out.push(...(await walkFiles(abs)));
              else out.push(abs);
            }
            return out;
          }

          function toPosix(p: string): string {
            return p.split(path.sep).join('/');
          }

          function toDataUri(filePath: string, buf: Buffer): string {
            const ext = path.extname(filePath).toLowerCase();
            const mime =
              ext === '.svg'
                ? 'image/svg+xml'
                : ext === '.png'
                  ? 'image/png'
                  : ext === '.jpg' || ext === '.jpeg'
                    ? 'image/jpeg'
                    : ext === '.gif'
                      ? 'image/gif'
                      : 'application/octet-stream';
            return `data:${mime};base64,${buf.toString('base64')}`;
          }

          async function loadIconMap(rootDir: string): Promise<Record<string, string>> {
            try {
              const files = await walkFiles(rootDir);
              const map: Record<string, string> = {};
              for (const abs of files) {
                const rel = toPosix(path.relative(rootDir, abs));
                const buf = await fs.readFile(abs);
                map[rel] = toDataUri(abs, buf);
              }
              return map;
            } catch (err) {
              void err;
              return {};
            }
          }

          const editorIcons = await loadIconMap(path.resolve(__dirname, 'public/image/editor'));
          const manageIcons = await loadIconMap(path.resolve(__dirname, 'public/image/manage'));

          return [
            `export const editorIcons = ${JSON.stringify(editorIcons)};`,
            `export const manageIcons = ${JSON.stringify(manageIcons)};`,
            `export function getEditorIcon(icon) { return editorIcons[icon] || ''; }`,
            `export function getManageIcon(icon) { return manageIcons[icon] || ''; }`
          ].join('\n');
        }
      },
      vue()
    ],
    optimizeDeps: {
      exclude: ['virtual:visual-craft-core-public-assets']
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: isServe
      ? {
          port: 1430,
          strictPort: false
        }
      : undefined,
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'VisualCraftCore',
        cssFileName: 'visual-craft-core',
        formats: ['es', 'cjs'],
        fileName: format => (format === 'es' ? 'index.mjs' : 'index.cjs')
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      }
    }
  };
});
