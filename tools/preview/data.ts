// Synthetic examples shaped after the pinned upstream management API and panel fixtures.
const at = '2026-10-31T12:00:00Z';
const version = '6337fc823ce20251c';
const actor = { source: 'github', id: 'demo-maintainer', name: { zh: '示例维护者', en: 'Demo maintainer' } };
const link = 'https://example.test/github/issues/42';
const thread = { key: 'github:42', source: 'github', title: '#42 登录页标题溢出', stage: 'subscribed', createdAt: at, lastAt: at,
  subscriptions: 1, tickets: [{ id: 'demo-1', title: '修复登录页标题溢出', state: 'open' }], pending: 0, url: link,
  facts: { number: { value: '#42' }, ci: { label: { zh: 'CI', en: 'CI' }, value: '通过' } } };
const base = { id: 'demo-1', title: '修复登录页标题溢出', state: 'open', actions: { retry: false, stop: true },
  stage: 'person', action: 'answer', strength: 'explicit', assignments: 1, inputs: 2, undelivered: 0,
  sessionId: 'worker-demo-1', directory: '/srv/superagent/work/fix-login-title', summary: '桌面端修复已验证，等待确认移动端范围。',
  attention: { id: 'attention-demo', question: '本次是否包含移动端？桌面端修复已完成，移动端需要单独确认范围。' },
  note: { text: '本次是否包含移动端？', error: false }, reply: { url: link, label: { zh: 'GitHub', en: 'GitHub' } },
  createdAt: at, updatedAt: at, threads: [thread] };
const review = { ...base, id: 'demo-2', title: '修正设置页提示文案', action: 'review', attention: undefined,
  note: { text: '验证完成，PR 草稿已整理为可审查结果。', error: false }, sessionId: 'worker-demo-2',
  summary: '改动与测试结果已提交，等待人工审查。' };
const working = { ...base, id: 'demo-3', title: '跟进 PR 的审查反馈', stage: 'working', action: undefined,
  attention: undefined, note: undefined, sessionId: 'worker-demo-3' };
const source = { id: 'github', kind: 'github', title: { zh: 'GitHub', en: 'GitHub' }, installed: true,
  description: { zh: '接收示例仓库中的请求与后续讨论', en: 'Demo repository events' }, labels: {}, revision: 1, restarts: [],
  value: { enabled: true, config: { repository: 'example/demo', cli: 'gh-agent', observeComments: true, observeIssues: true } },
  facts: { login: 'dsh-demo-agent' }, fields: [
    { key: 'repository', type: 'text', label: { zh: '监听的仓库', en: 'Repository' } },
    { key: 'cli', type: 'text', label: { zh: '智能体的 GitHub CLI', en: 'Agent CLI' } }],
  policy: { explicit: { zh: '名单中的人 @ 智能体可以发起工作。', en: 'Allowed people can mention the agent.' },
    fields: [{ key: 'allowed', type: 'rows', label: { zh: '能发起工作的 GitHub 账号', en: 'Allowed users' },
      columns: [{ key: 'id', type: 'text', label: { zh: '账号', en: 'Login' } }] }],
    rows: ['issues', 'comments'].map(id => ({ id, label: { zh: id === 'issues' ? '新 Issue' : '评论与审查反馈', en: id },
      note: { zh: '演示接收范围', en: 'Demo scope' }, cells: { listedUnaddressed: true, unlistedAddressed: true, unlistedUnaddressed: true } })) } };
const policy = { sources: { github: { allowed: [{ id: 'demo-maintainer' }], admission: {} } }, rules: [
  { id: 'copy', name: '明确的文案修复', enabled: true, instruction: '修正有明确目标的拼写、标点和已有翻译，保持业务含义。' },
  { id: 'visual', name: '局部视觉缺陷', enabled: true, instruction: '按明确目标修复溢出、对齐与间距，不自行扩大到重新设计。' } ] };
const executor = { model: null, maxWorkers: 3, directory: '/srv/superagent/work',
  prepare: 'git -C /srv/repos/demo worktree add "$DSH_SUPERAGENT_DIR" -b "agent/$DSH_SUPERAGENT_NAME" HEAD', blockedCommands: ['gh-personal'] };
const history = { current: 1, policyVersion: version, items: [{ revision: 1, savedAt: at, source: 'panel', policyVersion: version,
  policyChanged: true, notified: [], block: 'policy', changes: [] }] };
export const responses: Record<string, unknown> = {
  state: { setup: { machine: { stateDir: '/srv/superagent', promptMaxChars: 100000, admissionContextMaxPages: 10,
      admissionContextTimeoutMs: 15000 }, problem: null, feishuProblem: null, accounts: { repository: 'example/demo', agent: 'dsh-demo-agent' } },
    load: { running: 1, queued: 0, maxWorkers: 3 }, masterId: 'demo-master', paused: false, health: {} },
  overview: { problems: [], person: [base, review], executor: { running: 1, queued: 0, maxWorkers: 3, idle: 1 },
    flow: { received: 18, filtered: 4, triggers: 14, judged: 8, accepted: 3, evaluating: 0, dropped: 0 }, policyVersion: version },
  settings: { policyVersion: version, blocks: { policy: { revision: 1, value: policy }, eval: { revision: 1, value: { mode: 'observe',
      timeoutSeconds: 120, model: null } }, executor: { revision: 1, value: executor } }, sources: [source],
    environment: { root: '/srv/superagent/work', variables: [{ owner: 'executor', enabled: true, variables: [
      { key: 'DSH_SUPERAGENT_DIR', description: { zh: '工单执行目录', en: 'Ticket directory' } },
      { key: 'DSH_SUPERAGENT_NAME', description: { zh: '工单短名', en: 'Ticket short name' } }] }] } },
  'tickets/demo-1': { ...base, paused: false, threads: [thread],
    decision: { id: 'decision-demo', kind: 'accept', outcome: 'accept', reason: [{ code: 'explicitRouted' }], at,
      strength: 'explicit', triggerIds: ['trigger-demo'], thread: 'github:42', rules: [], preview: '@agent 请修复标题溢出' },
    mandate: { strength: 'explicit', policyVersion: version, basis: { via: 'addressed', sender: actor.id, addressed: 'mention' },
      actor, scope: '按现有桌面布局修复登录页标题溢出，不修改认证逻辑。' },
    basis: { facts: [{ name: 'sender', value: actor.id }, { name: 'addressed', value: 'mention' }], legacy: false },
    environment: [{ key: 'DSH_SUPERAGENT_DIR', value: base.directory, description: { zh: '执行目录', en: 'Directory' }, owner: 'executor' }],
    channels: [{ source: 'github', url: link, label: { zh: 'GitHub #42', en: 'GitHub #42' } }],
    assignments: [{ id: 'assignment-demo', state: 'running', createdAt: at, startedAt: at,
      report: { state: 'progress', summary: '演示：桌面端修复与测试已完成，等待范围确认。', at } }],
    inputs: [{ id: 'input-demo', kind: 'trigger', triggerId: 'trigger-demo', at, delivered: true,
      trigger: { id: 'trigger-demo', actor, human: true, preview: '@agent 请修复标题溢出', thread: 'github:42' } }] },
  tickets: { items: [base, review, working], total: 3, next_offset: null },
  sources: [{ id: 'github', title: source.title, installed: true, enabled: true, state: 'ready', health: [{ name: 'github', state: 'ready',
    detail: '' }], stats: { received: 18, filtered: 4, lastAt: at }, filtered: [], dropped: [] }],
  'policy/history': history, models: { default: { provider: 'demo-provider', model: 'demo-model' }, groups: [] },
  threads: { items: [thread], total: 1, next_offset: null }, decisions: { items: [], total: 0, next_offset: null },
  search: { tickets: [], threads: [], items: [] },
};
