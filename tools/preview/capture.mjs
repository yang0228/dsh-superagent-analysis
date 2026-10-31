import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { serve } from './serve.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const server = serve(0); await new Promise(resolve => server.once('listening', resolve));
const port = server.address().port;
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const errors = [], network = [], checks = [];
  const context = await browser.newContext({ viewport: { width: 1360, height: 1000 }, deviceScaleFactor: 1.5 });
  await context.route('**/*', route => { const url = new URL(route.request().url());
    if (url.origin !== `http://127.0.0.1:${port}`) { network.push(url.href); return route.abort(); }
    return route.continue(); });
  for (const view of ['overview', 'ticket', 'policy', 'execution']) {
    const page = await context.newPage(); page.on('pageerror', error => errors.push(`${view}: ${error.message}`));
    await page.goto(`http://127.0.0.1:${port}/?view=${view}`, { waitUntil: 'networkidle' });
    const expected = { overview: '待处理工单', ticket: '按现有桌面布局修复登录页标题溢出', policy: '明确的文案修复', execution: '准备命令' }[view];
    await page.getByText(expected, { exact: false }).first().waitFor();
    if (view === 'execution') assert.equal(await page.getByLabel('执行目录的根目录', { exact: true }).inputValue(), '/srv/superagent/work');
    assert.equal(await page.locator('.dt-error').count(), 0, `${view} has UI errors`);
    const readOnly = await page.evaluate(async () => (await fetch('/orchestrator/api/settings/policy', { method: 'PUT', body: '{}' })).status);
    assert.equal(readOnly, 405);
    assert.ok(await page.getByText('上游界面，演示数据', { exact: false }).isVisible());
    const requests = await page.evaluate(() => window.__previewRequests);
    checks.push({ view, readOnlyStatus: readOnly, requests: requests.length });
    await page.screenshot({ path: resolve(root, 'assets/screenshots', view + '.png'), fullPage: true });
    await page.close();
  }
  assert.deepEqual(errors, []); assert.deepEqual(network, []);
  writeFileSync(resolve(root, 'assets/screenshots/capture-report.json'), JSON.stringify({ upstream: '6337fc823ce20251c8de8085948165c81aaa701e',
    dataset: 'synthetic', components: 'pinned upstream React App', externalRequests: network, pageErrors: errors, checks }, null, 2) + '\n');
  console.log('PASS: 4 screenshots; no page errors or external requests; writes rejected (405).');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
