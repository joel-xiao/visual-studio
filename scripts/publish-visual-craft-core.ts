#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Args = {
  tag: string;
  otp?: string;
  registry: string;
  dryRun: boolean;
  bump: 'none' | 'prerelease' | 'patch' | 'minor' | 'major';
  preid: string;
  commit: boolean;
  allowDirty: boolean;
};

// eslint-disable-next-line no-redeclare
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-redeclare
const __dirname = path.dirname(__filename);

const repoRoot = path.join(__dirname, '..');
const pkgDir = path.join(repoRoot, 'packages', 'visual-craft-core');
const pkgJsonPath = path.join(pkgDir, 'package.json');

function run(cmd: string, cwd: string) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function runOut(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

function parseArgs(argv: string[]): Args {
  let bumpProvided = false;
  let commitProvided = false;
  let allowDirtyProvided = false;

  const args: Args = {
    tag: 'test',
    registry: 'https://registry.npmjs.org/',
    dryRun: false,
    bump: 'prerelease',
    preid: 'test',
    commit: true,
    allowDirty: false
  };

  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const [k, vRaw] = raw.split('=');
    const v = vRaw ?? '';

    if (k === '--tag') args.tag = v || 'test';
    else if (k === '--registry') args.registry = v || args.registry;
    else if (k === '--otp') args.otp = v || undefined;
    else if (k === '--dry-run') args.dryRun = true;
    else if (k === '--no-commit') {
      args.commit = false;
      commitProvided = true;
    } else if (k === '--allow-dirty') {
      args.allowDirty = true;
      allowDirtyProvided = true;
    } else if (k === '--commit') {
      args.commit = true;
      commitProvided = true;
    }
    else if (k === '--bump') {
      if (v === 'none' || v === 'prerelease' || v === 'patch' || v === 'minor' || v === 'major') {
        args.bump = v;
        bumpProvided = true;
      }
    } else if (k === '--preid') args.preid = v || args.preid;
  }

  if (args.tag !== 'test' && args.tag !== 'latest' && args.bump === 'prerelease') {
    args.bump = 'patch';
  }

  if (args.tag === 'latest' && args.preid === 'test') {
    args.preid = 'rc';
  }

  if (process.env.NPM_OTP && !args.otp) args.otp = process.env.NPM_OTP;

  if (args.dryRun) {
    if (!bumpProvided) args.bump = 'none';
    if (!commitProvided) args.commit = false;
    if (!allowDirtyProvided) args.allowDirty = true;
  }

  return args;
}

function ensureCleanGit(args: Args) {
  if (args.allowDirty) return;
  const status = runOut('git status --porcelain', repoRoot);
  if (status) {
    throw new Error('工作区有未提交改动，请先提交或加 --allow-dirty');
  }
}

function ensureNpmAuth(registry: string) {
  try {
    runOut(`npm whoami --registry ${registry}`, pkgDir);
  } catch {
    throw new Error(`npm 未登录或无权限，请先执行：npm login --registry ${registry}`);
  }
}

function readPkgVersion(): string {
  const raw = fs.readFileSync(pkgJsonPath, 'utf-8');
  const json = JSON.parse(raw) as { version?: string };
  if (!json.version) throw new Error('无法读取 packages/visual-craft-core/package.json version');
  return json.version;
}

function bumpVersion(args: Args) {
  if (args.bump === 'none') return;
  if (args.bump === 'prerelease') {
    run(`npm version prerelease --preid ${args.preid} --no-git-tag-version`, pkgDir);
    return;
  }
  run(`npm version ${args.bump} --no-git-tag-version`, pkgDir);
}

function commitVersionIfNeeded(args: Args) {
  if (!args.commit) return;
  const version = readPkgVersion();
  const changed = runOut(
    `git diff --name-only -- ${path.posix.join('packages', 'visual-craft-core', 'package.json')}`,
    repoRoot
  );
  if (!changed) return;

  run(`git add ${path.posix.join('packages', 'visual-craft-core', 'package.json')}`, repoRoot);
  run(`git commit -m "chore(core): release visual-craft-core@${version}"`, repoRoot);
}

function buildCore() {
  run('pnpm -F visual-craft-core build', repoRoot);
}

function publish(args: Args) {
  const otpArg = args.otp ? ` --otp=${args.otp}` : '';
  const dryArg = args.dryRun ? ' --dry-run' : '';
  run(`npm publish --tag ${args.tag} --registry ${args.registry}${otpArg}${dryArg}`, pkgDir);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  ensureCleanGit(args);
  ensureNpmAuth(args.registry);

  bumpVersion(args);
  buildCore();
  publish(args);
  commitVersionIfNeeded(args);

  const version = readPkgVersion();
  console.log(`\nPublished: visual-craft-core@${version} (tag: ${args.tag})`);
}

main();
