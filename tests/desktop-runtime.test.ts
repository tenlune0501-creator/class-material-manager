import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error Desktop bootstrap runs directly as Node ESM, outside the TS app.
import { sourceDigest, verifyBuild, isLocalRequest } from '../desktop/identity.mjs';

describe('Desktop source identity and local runtime boundary', () => {
  it('detects source edits/additions/deletions but excludes generated hidden output', async () => {
    const root = await mkdtemp(join(tmpdir(), 'cmm-desktop-'));
    try {
      await mkdir(join(root, 'app'));
      await writeFile(join(root, 'app/page.tsx'), 'first');
      const first = await sourceDigest(root, ['app']);
      await mkdir(join(root, 'app/.runtime'));
      await writeFile(join(root, 'app/.runtime/log'), 'generated');
      assert.equal(await sourceDigest(root, ['app']), first);
      await writeFile(join(root, 'app/page.tsx'), 'second');
      const second = await sourceDigest(root, ['app']);
      assert.notEqual(second, first);
      await writeFile(join(root, 'app/new.tsx'), 'new route');
      assert.notEqual(await sourceDigest(root, ['app']), second);
      await rm(join(root, 'app/new.tsx'));
      assert.equal(await sourceDigest(root, ['app']), second);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it('rejects old source, replaced Next builds, and an EXE pinned to another build', () => {
    const manifest = { source: 'source', buildId: 'build' };
    assert.doesNotThrow(() => verifyBuild(manifest, { source: 'source', buildId: 'build', expectedBuildId: 'build' }));
    for (const values of [
      { source: 'changed', buildId: 'build', expectedBuildId: 'build' },
      { source: 'source', buildId: 'replaced', expectedBuildId: 'build' },
      { source: 'source', buildId: 'build', expectedBuildId: 'old-exe' },
    ]) assert.throws(() => verifyBuild(manifest, values), /mismatch/);
  });
  it('rejects DNS-rebinding Host and cross-origin browser requests', () => {
    assert.ok(isLocalRequest({ host: '127.0.0.1:4318' }, 4318));
    assert.ok(isLocalRequest({ host: '127.0.0.1:4318', origin: 'http://127.0.0.1:4318' }, 4318));
    assert.ok(!isLocalRequest({ host: 'evil.example:4318' }, 4318));
    assert.ok(!isLocalRequest({ host: '127.0.0.1:4318', origin: 'https://evil.example' }, 4318));
    assert.ok(!isLocalRequest({ host: '127.0.0.1:4318', 'sec-fetch-site': 'cross-site' }, 4318));
    assert.ok(!isLocalRequest({ host: '127.0.0.1:4319' }, 4318));
  });
});
