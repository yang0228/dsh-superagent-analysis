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
  const errors = [], network = [], checks = [], snapshots = {};
  const context = await browser.newContext({ viewport: { width: 1000, height: 720 }, deviceScaleFactor: 2, timezoneId: 'Asia/Shanghai' });
  await context.route('**/*', route => { const url = new URL(route.request().url());
    if (url.origin !== `http://127.0.0.1:${port}`) { network.push(url.href); return route.abort(); }
    return route.continue(); });
  for (const view of ['overview', 'ticket', 'followup', 'policy', 'execution']) {
    const page = await context.newPage(); page.on('pageerror', error => errors.push(`${view}: ${error.message}`));
    await page.clock.setFixedTime(new Date('2026-10-31T12:20:00Z'));
    await page.goto(`http://127.0.0.1:${port}/?view=${view}`, { waitUntil: 'networkidle' });
    const expected = { overview: '待处理工单', ticket: '按现有桌面布局修复登录页标题溢出', followup: '按现有桌面布局修复登录页标题溢出', policy: '明确的文案修复', execution: '准备命令' }[view];
    await page.getByText(expected, { exact: false }).first().waitFor();
    if (view === 'overview') {
      const overview = await page.evaluate(async () => (await fetch('/orchestrator/api/overview')).json());
      assert.deepEqual(overview.person.map(ticket => ticket.threads[0].facts.number.value), ['#42', '#43']);
    }
    if (view === 'ticket' || view === 'followup') {
      snapshots[view] = await page.evaluate(async () => (await fetch('/orchestrator/api/tickets/demo-1')).json());
      if (view === 'ticket') {
        assert.ok(await page.locator('.dt-banner').getByText('移动端是否保持现状？', { exact: false }).isVisible());
      } else {
        assert.equal(await page.locator('.dt-banner').count(), 0, 'Follow-up must clear the human question');
        await page.getByRole('button', { name: '已送达的输入 · 2', exact: true }).click();
        await page.getByRole('button', { name: '标识', exact: true }).click();
        assert.ok(await page.locator('.dt-details').getByText('移动端保持不变，请按原范围完成桌面端验证。', { exact: false }).isVisible());
        assert.ok(await page.locator('#app').getByText('demo-1', { exact: true }).isVisible());
        assert.ok(await page.locator('#app').getByText('/srv/superagent/work/fix-login-title', { exact: true }).isVisible());
      }
    }
    if (view === 'execution') assert.equal(await page.getByLabel('执行目录的根目录', { exact: true }).inputValue(), '/srv/superagent/work');
    assert.equal(await page.locator('.dt-error').count(), 0, `${view} has UI errors`);
    const readOnly = await page.evaluate(async () => (await fetch('/orchestrator/api/settings/policy', { method: 'PUT', body: '{}' })).status);
    assert.equal(readOnly, 405);
    assert.ok(await page.getByText('上游界面，演示数据', { exact: false }).first().isVisible());
    await page.evaluate(() => document.fonts.ready);
    const path = resolve(root, 'assets/screenshots', view + '.png');
    let captureHeight;
    if (view === 'ticket') {
      const mandate = await page.locator('.dt-section').filter({ has: page.getByText('授权详情', { exact: true }) }).boundingBox();
      captureHeight = Math.ceil(mandate.y + mandate.height + 24);
      await page.setViewportSize({ width: 1000, height: captureHeight });
      await page.screenshot({ path });
    } else {
      await page.locator('.preview-frame').screenshot({ path });
      captureHeight = Math.ceil((await page.locator('.preview-frame').boundingBox()).height);
    }
    const requests = await page.evaluate(() => window.__previewRequests);
    checks.push({ view, readOnlyStatus: readOnly, requests: requests.length,
      captureHeight, region: view === 'ticket' ? 'header through mandate details' : 'preview frame' });
    await page.close();
  }
  const before = snapshots.ticket, after = snapshots.followup;
  for (const key of ['id', 'sessionId', 'directory']) assert.equal(before[key], after[key], `${key} must remain the same`);
  assert.equal(before.assignments.length, 1); assert.equal(after.assignments.length, 1);
  assert.equal(before.assignments.at(-1).id, after.assignments.at(-1).id, 'A human answer resumes the current assignment');
  assert.deepEqual(before.mandate, after.mandate, 'Answer must not expand the mandate');
  assert.equal(before.inputs.length, 1); assert.equal(after.inputs.length, 2);
  assert.equal(before.stage, 'person'); assert.equal(after.stage, 'working');
  assert.equal(after.attention, undefined); assert.ok(after.inputs.every(input => input.delivered));
  assert.deepEqual(errors, []); assert.deepEqual(network, []);
  writeFileSync(resolve(root, 'assets/screenshots/capture-report.json'), JSON.stringify({ upstream: '6337fc823ce20251c8de8085948165c81aaa701e',
    dataset: 'synthetic', components: 'pinned upstream React App', externalRequests: network, pageErrors: errors,
    viewport: { width: 1000, height: 720, deviceScaleFactor: 2, timezone: 'Asia/Shanghai' }, capture: 'content-bounded; ticket focused on attention and mandate', clock: '2026-10-31T12:20:00Z',
    continuity: { ticketId: after.id, sessionId: after.sessionId, sameDirectory: true, sameAssignment: true, unchangedMandate: true,
      inputsBefore: before.inputs.length, inputsAfter: after.inputs.length, from: before.stage, to: after.stage }, checks }, null, 2) + '\n');
  console.log('PASS: 5 content-bounded screenshots; same Ticket/Session/directory/assignment/mandate; no page errors or external requests; writes rejected (405).');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
