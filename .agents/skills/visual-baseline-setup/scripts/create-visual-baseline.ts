#!/usr/bin/env node
// @ts-nocheck
import process from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium, type BrowserContextOptions } from 'playwright';

type ViewportName = 'desktop' | 'tablet' | 'mobile';

type Viewport = { width: number; height: number };

const DEFAULT_VIEWPORTS: Record<ViewportName, Viewport> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

// Project standard: desktop 1440x900, tablet 768x1024, mobile 390x844.
// evaluate-visual-diff.ts consumes the manifest written below and renders at
// the exact baseline contract size (manifest first, then baseline PNG
// dimensions), so a baseline captured with these defaults compares without
// dimension-mismatch.

function getArg(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  return fallback;
}

function parseList(value: string | undefined, fallback: ViewportName[]): ViewportName[] {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) as ViewportName[];
}

function parseMasks(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

async function main() {
  const url = getArg('url');
  const outDir = resolve(getArg('out', './visual-baseline')!);
  const scope = getArg('scope', 'page')!;
  const capture = getArg('capture', 'viewport');
  const selector = getArg('selector');
  const viewports = parseList(getArg('viewports'), ['desktop', 'mobile', 'tablet']);
  const masks = parseMasks(getArg('mask'));
  const readySelector = getArg('ready-selector');

  if (!url) {
    console.error('Missing --url=<page-url>');
    process.exit(1);
  }

  // Clip mode captures a single element: for slices that defer sections, the
  // deferred areas stay out of the baseline instead of failing the diff later.
  const captureMode = selector ? 'clip' : capture;

  // Canonical layout (see baseline-contract.md): <out>/<scope>/<viewport>/
  // is tracked in git so the PR branch carries its own baselines for QA.
  const scopeDir = join(outDir, scope);
  await mkdir(scopeDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const engineVersion = browser.version();
  const contextOptions: BrowserContextOptions = {
    deviceScaleFactor: 1,
  };

  const entries: Record<string, unknown> = {};

  for (const name of viewports) {
    const viewport = DEFAULT_VIEWPORTS[name];
    console.log(`Capturing baseline "${name}" at ${viewport.width}x${viewport.height} (${captureMode})...`);
    const context = await browser.newContext({
      ...contextOptions,
      viewport,
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    if (readySelector) {
      await page.waitForSelector(readySelector, { state: 'visible' });
    }

    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          caret-color: transparent !important;
        }
      `,
    });

    const targetDir = join(scopeDir, name);
    await mkdir(targetDir, { recursive: true });
    const screenshotPath = join(targetDir, `${name}.png`);

    if (selector) {
      const target = page.locator(selector).first();
      await target.waitFor({ state: 'visible' });
      await target.screenshot({
        path: screenshotPath,
        animations: 'disabled',
        mask: masks.map((item) => page.locator(item)),
      });
    } else {
      await page.screenshot({
        path: screenshotPath,
        fullPage: capture === 'full-page',
        animations: 'disabled',
        mask: masks.map((item) => page.locator(item)),
      });
    }

    const manifest = {
      version: 1,
      url,
      scope,
      capture: captureMode,
      selector: selector ?? null,
      viewport: { name, ...viewport },
      engine: { name: 'chromium', version: engineVersion },
      deviceScaleFactor: 1,
      masks,
      readySelector: readySelector ?? null,
      screenshot: screenshotPath,
      createdAt: new Date().toISOString(),
    };

    await writeFile(join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    entries[name] = manifest;
    await context.close();
  }

  await writeFile(
    join(scopeDir, 'manifest.json'),
    JSON.stringify(
      {
        version: 1,
        url,
        scope,
        capture: captureMode,
        viewports: entries,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    'utf8',
  );

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
