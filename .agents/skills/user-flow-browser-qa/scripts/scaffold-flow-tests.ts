#!/usr/bin/env node
// @ts-nocheck
import process from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

function parseArgs(argv) {
  const out = { dir: '', flow: 'user-flow' };
  for (const arg of argv.slice(2)) {
    const [key, value] = arg.split('=');
    if (key === '--dir' && value) out.dir = resolve(value);
    if (key === '--flow' && value) out.flow = value;
  }
  return out;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'user-flow';
}

async function main() {
  const { dir, flow } = parseArgs(process.argv);
  if (!dir) {
    console.error('Missing --dir=<target-directory>');
    process.exit(1);
  }

  const flowDir = join(dir, slugify(flow));
  await mkdir(flowDir, { recursive: true });

  const files = {
    'happy-path.md': `# Happy path\n\n- Flow: ${flow}\n- Status: pending\n- Expected: document the exact automated happy path here\n`,
    'critical-paths.md': `# Critical paths\n\n- Flow: ${flow}\n- Status: pending\n- Expected: document the important failure/branch cases here\n`,
    'selectors.md': `# Stable selectors\n\n- Prefer data-testid\n- Then id\n- Then stable classes\n- Avoid brittle text-only selectors if a stable hook exists\n`,
  };

  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(flowDir, name), content, 'utf8');
  }

  process.stdout.write(JSON.stringify({ flowDir, files: Object.keys(files) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
