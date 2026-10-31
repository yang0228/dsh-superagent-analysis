import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@upstream/client/app.tsx';
import { zh } from '@upstream/client/locales.ts';
import { responses } from './data';
const views = { overview: { page: 'overview' }, ticket: { page: 'execution', id: 'demo-1' },
  policy: { page: 'settings', query: { group: 'eval' } }, execution: { page: 'settings', query: { group: 'execution' } } };
const view = new URLSearchParams(location.search).get('view') || 'overview';
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
