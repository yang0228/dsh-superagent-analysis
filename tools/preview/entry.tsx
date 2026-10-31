import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@upstream/client/app.tsx';
import { zh } from '@upstream/client/locales.ts';
import { responsesFor } from './data';
const views = { overview: { page: 'overview' }, ticket: { page: 'execution', id: 'demo-1' },
  followup: { page: 'execution', id: 'demo-1' },
  policy: { page: 'settings', query: { group: 'eval' } }, execution: { page: 'settings', query: { group: 'execution' } } };
const view = new URLSearchParams(location.search).get('view') || 'overview';
const responses = responsesFor(view);
const scenes = {
  overview: ['01 / 03', '先看哪里需要人', '同一时刻：登录修复在等回答，文案修复待审查，另一任务仍在执行。', '观察重点：只呈现需要人处理的工作；其他任务继续推进。'],
  ticket: ['02 / 03', '看清授权，再回答问题', 'Issue #42 → Ticket demo-1 · worker-demo-1 · 当前只授权修复桌面端。', '观察重点：问题与授权范围同时可见；在原 GitHub 讨论中回答。'],
  followup: ['03 / 03', '收到回答，在原任务继续', '同一 Ticket demo-1 · 同一 Session worker-demo-1 · 回答不扩大原授权范围。', '观察重点：展开已送达输入与标识，核对新回答、原请求和同一工作目录。'],
  policy: ['设置参考', '接收哪些请求，何时主动接单', '允许名单、接收规则与 observe 模式分别控制不同环节。', '边界：observe 不阻止允许用户的显式请求执行。'],
  execution: ['设置参考', '为任务准备目录与执行资源', '配置普通并发、工作目录和 prepare 命令。', '边界：目录与命令包装不等于 OS 沙箱；本演示未创建 worktree。'],
};
const scene = scenes[view] || scenes.overview;
createRoot(document.getElementById('story')!).render(<><div className="preview-kicker">演示导读 · {scene[0]}</div><h1>{scene[1]}</h1><p>{scene[2]}</p></>);
document.getElementById('scene-note')!.textContent = scene[3];
sessionStorage.clear();
sessionStorage.setItem('dsh-superagent/route', JSON.stringify({ route: views[view] || views.overview, stack: [] }));
window.__previewRequests = [];
window.fetch = async (input, init) => {
  const url = new URL(String(input), location.href);
  const method = (init?.method || 'GET').toUpperCase();
  window.__previewRequests.push({ url: url.href, method });
  if (url.origin !== location.origin || !url.pathname.startsWith('/orchestrator/api/')) throw new Error('Preview blocks external requests');
  if (method !== 'GET') return new Response(JSON.stringify({ error: '离线演示为只读，未提交任何更改。' }), { status: 405 });
  const key = decodeURIComponent(url.pathname.slice('/orchestrator/api/'.length));
  const body = responses[key];
  if (body === undefined) return new Response(JSON.stringify({ error: '此页面未提供演示数据。' }), { status: 404 });
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
};
document.addEventListener('click', event => {
  const link = (event.target as Element).closest?.('a[href]');
  if (link && new URL(link.getAttribute('href')!, location.href).origin !== location.origin) event.preventDefault();
}, true);
const t = (key, params) => (zh[key] ?? key).replace(/\{(\w+)\}/g, (whole, name) => params?.[name] ?? whole);
createRoot(document.getElementById('app')!).render(<App t={t} deploymentForm={undefined}
  openSession={async () => { throw new Error('此为组件演示，未连接真实 DSH Session。'); }} />);
