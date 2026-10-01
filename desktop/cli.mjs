import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { sourceDigest } from './identity.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mode = process.argv[2];
if (!['dev', 'build', 'runtime-dev'].includes(mode)) throw new Error('Expected dev, build, or runtime-dev');
const env = { ...process.env, CMM_DESKTOP: '1', CMM_NODE_PATH: process.execPath,
  PATH: `${join(homedir(), '.cargo', 'bin')};${process.env.PATH}` };
function run(script, args, cwd = root) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, env, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
await mkdir(join(root, 'desktop/.runtime'), { recursive: true });
if (mode === 'runtime-dev') {
  run(join(root, 'desktop/server.mjs'), ['dev', '4318', 'terminal']);
} else {
  if (mode === 'build') {
    const before = await sourceDigest(root);
    run(join(root, 'viewer/node_modules/next/dist/bin/next'), ['build'], join(root, 'viewer'));
    const after = await sourceDigest(root);
    if (before !== after) throw new Error('Source changed during build. Retry desktop:build.');
    const buildId = (await readFile(join(root, 'viewer/.next-desktop/BUILD_ID'), 'utf8')).trim();
    const commit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true });
    await writeFile(join(root, 'desktop/.runtime/build.json'), JSON.stringify({
      source: after, buildId, commit: commit.stdout.trim(), builtAt: new Date().toISOString(),
    }, null, 2));
    env.CMM_BUILD_ID = buildId;
  }
  run(join(root, 'node_modules/@tauri-apps/cli/tauri.js'),
    mode === 'build' ? ['build', '--no-bundle'] : ['dev', '--no-dev-server']);
}
