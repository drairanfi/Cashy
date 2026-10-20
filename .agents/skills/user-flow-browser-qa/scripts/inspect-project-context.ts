#!/usr/bin/env node
// @ts-nocheck
import process from 'node:process';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const out = { cwd: process.cwd() };
  for (const arg of argv.slice(2)) {
    const [key, value] = arg.split('=');
    if (key === '--cwd' && value) out.cwd = resolve(value);
  }
  return out;
}

function walkUp(start) {
  const dirs = [];
  let current = resolve(start);
  while (true) {
    dirs.push(current);
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return dirs;
}

function detectHarness(root) {
  const candidates = [
    { name: 'playwright', path: ['playwright.config.ts'], tests: ['tests', 'e2e', 'playwright'] },
    { name: 'vitest', path: ['vitest.config.ts', 'vite.config.ts'], tests: ['tests', '__tests__'] },
    { name: 'jest', path: ['jest.config.js', 'jest.config.ts'], tests: ['tests', '__tests__'] },
    { name: 'cypress', path: ['cypress.config.ts', 'cypress.config.js'], tests: ['cypress/e2e'] },
    { name: 'none', path: [], tests: ['_tests_'] },
  ];

  for (const candidate of candidates) {
    if (candidate.path.some((p) => existsSync(join(root, p)))) {
      return candidate;
    }
  }

  return candidates[candidates.length - 1];
}

function findRules(startDirs) {
  const found = [];
  for (const dir of startDirs) {
    for (const name of ['AGENTS.md', 'CLAUDE.md']) {
      const file = join(dir, name);
      if (existsSync(file)) found.push(file);
    }
  }
  return [...new Set(found)];
}

function main() {
  const { cwd } = parseArgs(process.argv);
  const chain = walkUp(cwd);
  const repoRoot = chain.find((dir) => existsSync(join(dir, '.git'))) || cwd;
  const harness = detectHarness(repoRoot);
  const rules = findRules(chain.slice(0, 5));
  const packageJsonPath = join(repoRoot, 'package.json');
  const packageJson = existsSync(packageJsonPath) ? JSON.parse(readFileSync(packageJsonPath, 'utf8')) : null;

  const report = {
    cwd,
    repoRoot,
    rules,
    harness: harness.name,
    suggestedTestsDir: harness.tests[0],
    packageScripts: packageJson?.scripts ? Object.keys(packageJson.scripts) : [],
  };

  process.stdout.write(JSON.stringify(report, null, 2));
}

main();
