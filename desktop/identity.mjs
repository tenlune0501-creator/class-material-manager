import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Explicit inputs: no .env values, user data, portfolios, build output or secrets.
export const inputs = [
  'viewer/app', 'viewer/components', 'viewer/lib', 'viewer/public',
  'viewer/proxy.ts', 'viewer/next.config.ts', 'viewer/tsconfig.json',
  'viewer/package.json', 'viewer/package-lock.json',
  'desktop/server.mjs', 'desktop/cli.mjs', 'desktop/identity.mjs', 'desktop/bootstrap',
  'src-tauri/src', 'src-tauri/build.rs', 'src-tauri/Cargo.toml', 'src-tauri/tauri.conf.json',
];

export async function sourceDigest(root, paths = inputs) {
  const hash = createHash('sha256');
  async function visit(path) {
    let children;
    try { children = await readdir(path, { withFileTypes: true }); }
    catch (error) {
      if (error.code !== 'ENOTDIR') throw error;
      hash.update(relative(root, path).replaceAll('\\', '/'));
      hash.update('\0');
      hash.update(await readFile(path));
      hash.update('\0');
      return;
    }
    for (const child of children.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      if (child.name.startsWith('.')) continue;
      if (child.isSymbolicLink()) throw new Error(`Symlink is not a Desktop source input: ${child.name}`);
      await visit(join(path, child.name));
    }
  }
  for (const path of [...paths].sort()) await visit(join(root, path));
  return hash.digest('hex');
}

export function verifyBuild(manifest, { source, buildId, expectedBuildId }) {
  if (manifest.source !== source || manifest.buildId !== buildId || buildId !== expectedBuildId) {
    throw new Error('Desktop source/build mismatch. Run npm run desktop:build again.');
  }
}

export function isLocalRequest(headers, port) {
  const origin = `http://127.0.0.1:${port}`;
  return headers.host === `127.0.0.1:${port}` &&
    (!headers.origin || headers.origin === origin) && headers['sec-fetch-site'] !== 'cross-site';
}
