import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = resolve(root, 'assets/diagrams');
const cli = process.env.MMDC || resolve(root, 'node_modules/.bin/mmdc');
const args = ['-c', resolve(directory, 'mermaid.config.json'), '-b', 'white', '--size', '1600', '-s', '2'];
if (process.env.CHROME_PATH) {
  const config = resolve(root, '.preview-puppeteer.json');
  writeFileSync(config, JSON.stringify({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] }));
  args.push('-p', config);
}
// architecture.svg is hand-laid-out and editable. architecture.mmd documents its relationships only.
for (const name of readdirSync(directory).filter(name => name.endsWith('.mmd') && name !== 'architecture.mmd').sort()) {
  for (const extension of ['svg', 'png']) {
    const result = spawnSync(cli, ['-i', resolve(directory, name), '-o', resolve(directory, name.replace('.mmd', '.' + extension)), ...args], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
const svgPath = resolve(directory, 'architecture.svg');
const svg = readFileSync(svgPath, 'utf8');
const width = Number(svg.match(/<svg[^>]*\bwidth="(\d+)"/)[1]);
const height = Number(svg.match(/<svg[^>]*\bheight="(\d+)"/)[1]);
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1.5 });
  await page.goto(pathToFileURL(svgPath).href); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(directory, 'architecture.png') });
  console.log('Rendered horizontal architecture.png from canonical architecture.svg.');
} finally { await browser.close(); }
