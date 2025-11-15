import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../../web/dist');
const targetDir = path.join(__dirname, '../dist/web');

function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

if (fs.existsSync(targetDir)) {
  removeDir(targetDir);
}
fs.mkdirSync(targetDir, { recursive: true });

function copyRecursiveSync(src: string, dest: string): void {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(sourceDir)) {
  console.error(`错误: 源目录不存在: ${sourceDir}`);
  console.error('请先构建 web 项目: pnpm build:web');
  process.exit(1);
}

const indexHtmlPath = path.join(sourceDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error(`错误: index.html 不存在: ${indexHtmlPath}`);
  console.error('请确保 web 项目已正确构建');
  process.exit(1);
}

console.log(`正在复制 ${sourceDir} 到 ${targetDir}...`);
try {
  copyRecursiveSync(sourceDir, targetDir);
  console.log('复制完成！');

  if (!fs.existsSync(path.join(targetDir, 'index.html'))) {
    console.error('警告: 复制后 index.html 不存在，请检查复制过程');
    process.exit(1);
  }
} catch (error) {
  console.error('复制文件时出错:', error);
  process.exit(1);
}

