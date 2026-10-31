// Synthetic examples shaped after the pinned upstream management API and panel fixtures.
const at = '2026-10-31T12:00:00Z';
const version = 'demo-policy-v1';
const questionAt = '2026-10-31T12:12:00Z';
const followupAt = '2026-10-31T12:18:00Z';
const request = '@dsh-demo-agent 请按现有桌面布局修复登录页标题溢出，不修改认证逻辑。';
const answer = '移动端保持不变，请按原范围完成桌面端验证。';
const actor = { source: 'github', id: 'demo-maintainer', name: { zh: '示例维护者', en: 'Demo maintainer' } };
const link = 'https://example.test/github/issues/42';
const thread = { key: 'github:42', source: 'github', title: '#42 登录页标题溢出', stage: 'subscribed', createdAt: at, lastAt: at,
  latest: { actor, preview: request }, subscriptions: 1, tickets: [{ id: 'demo-1', title: '修复登录页标题溢出', state: 'open' }], pending: 0, url: link,
  facts: { number: { value: '#42' }, ci: { label: { zh: 'CI', en: 'CI' }, value: '通过' } } };
const base = { id: 'demo-1', title: '修复登录页标题溢出', state: 'open', actions: { retry: false, stop: true },
  stage: 'person', action: 'answer', strength: 'explicit', assignments: 1, inputs: 1, undelivered: 0,
  sessionId: 'worker-demo-1', directory: '/srv/superagent/work/fix-login-title', summary: '桌面端修复已完成，确认移动端是否保持现状后继续验证。',
  attention: { id: 'attention-demo', question: '移动端是否保持现状？当前授权仅覆盖桌面端，本轮不会自行扩大修改范围。' },
  note: { text: '移动端是否保持现状？', error: false }, reply: { url: link, label: { zh: 'GitHub', en: 'GitHub' } },
  createdAt: at, updatedAt: questionAt, threads: [thread] };
const review = { ...base, id: 'demo-2', title: '修正设置页提示文案', action: 'review', attention: undefined,
  note: { text: '验证完成，PR 草稿已整理为可审查结果。', error: false }, sessionId: 'worker-demo-2',
  summary: '改动与测试结果已提交，等待人工审查。', threads: [{ ...thread, key: 'github:43', title: '#43 修正设置页提示文案', url: 'https://example.test/github/issues/43', latest: { actor, preview: '请修正设置页提示文案，保持原意。' }, facts: { number: { value: '#43' }, ci: thread.facts.ci }, tickets: [{ id: 'demo-2', title: '修正设置页提示文案', state: 'open' }] }], reply: undefined, directory: '/srv/superagent/work/fix-settings-copy' };
const working = { ...base, id: 'demo-3', title: '跟进 PR 的审查反馈', stage: 'working', action: undefined,
  attention: undefined, note: undefined, sessionId: 'worker-demo-3', reply: undefined, directory: '/srv/superagent/work/review-feedback', threads: [{ ...thread, key: 'github:44', title: 'PR #44 跟进审查反馈', url: 'https://example.test/github/pull/44', latest: { actor, preview: '请按审查意见补齐验证。' }, facts: { number: { value: '#44' }, ci: thread.facts.ci }, tickets: [{ id: 'demo-3', title: '跟进 PR 的审查反馈', state: 'open' }] }] };
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
  overview: { problems: [], person: [base, review], executor: { running: 1, queued: 0, maxWorkers: 3, idle: 0 },
    flow: { received: 18, filtered: 4, triggers: 14, judged: 8, accepted: 3, evaluating: 0, dropped: 0 }, policyVersion: version },
  settings: { policyVersion: version, blocks: { policy: { revision: 1, value: policy }, eval: { revision: 1, value: { mode: 'observe',
      timeoutSeconds: 120, model: null } }, executor: { revision: 1, value: executor } }, sources: [source],
    environment: { root: '/srv/superagent/work', variables: [{ owner: 'executor', enabled: true, variables: [
      { key: 'DSH_SUPERAGENT_DIR', description: { zh: '工单执行目录', en: 'Ticket directory' } },
      { key: 'DSH_SUPERAGENT_NAME', description: { zh: '工单短名', en: 'Ticket short name' } }] }] } },
  'tickets/demo-1': { ...base, paused: false, threads: [thread],
    decision: { id: 'decision-demo', kind: 'accept', outcome: 'accept', reason: [{ code: 'explicitRouted' }], at,
      strength: 'explicit', triggerIds: ['trigger-demo'], thread: 'github:42', rules: [], preview: request },
    mandate: { strength: 'explicit', policyVersion: version, basis: { via: 'addressed', sender: actor.id, addressed: 'mention' },
      actor, scope: '按现有桌面布局修复登录页标题溢出，不修改认证逻辑。' },
    basis: { facts: [{ name: 'sender', value: actor.id }, { name: 'addressed', value: 'mention' }], legacy: false },
    environment: [{ key: 'DSH_SUPERAGENT_DIR', value: base.directory, description: { zh: '执行目录', en: 'Directory' }, owner: 'executor' }],
    channels: [{ source: 'github', url: link, label: { zh: 'GitHub #42', en: 'GitHub #42' } }],
    assignments: [{ id: 'assignment-demo', state: 'running', createdAt: at, startedAt: at, ref: base.sessionId, turnEndedAt: questionAt,
      report: { state: 'waiting', summary: '演示：等待确认移动端保持现状。', at: questionAt } }],
    inputs: [{ id: 'input-demo', kind: 'trigger', triggerId: 'trigger-demo', at, delivered: true,
      trigger: { id: 'trigger-demo', actor, human: true, preview: request, thread: 'github:42' } }] },
  tickets: { items: [base, review, working], total: 3, next_offset: null },
  sources: [{ id: 'github', title: source.title, installed: true, enabled: true, state: 'ready', health: [{ name: 'github', state: 'ready',
    detail: '' }], stats: { received: 18, filtered: 4, lastAt: at }, filtered: [], dropped: [] }],
  'policy/history': history, models: { default: { provider: 'demo-provider', model: 'demo-model' }, groups: [] },
  threads: { items: [thread], total: 1, next_offset: null }, decisions: { items: [], total: 0, next_offset: null },
  search: { tickets: [], threads: [], items: [] },
};

// Independent static snapshots: selecting a view never runs an Agent or mutates a ticket.
export function responsesFor(view: string): Record<string, any> {
  if (view !== 'followup') return responses;
  const before = responses['tickets/demo-1'] as any;
  const continuedThread = { ...thread, lastAt: followupAt, latest: { actor, preview: answer } };
  const continued = { ...before, stage: 'working', action: undefined, attention: undefined, note: undefined,
    inputs: [
      { id: 'input-followup', kind: 'trigger', triggerId: 'trigger-followup', at: followupAt, delivered: true,
        trigger: { id: 'trigger-followup', actor, human: true, preview: answer, thread: thread.key } },
      ...before.inputs,
    ], updatedAt: followupAt, summary: '演示：收到回答，在原范围内继续桌面端验证。', threads: [continuedThread],
    assignments: before.assignments.map(item => ({ ...item, turnEndedAt: undefined,
      report: { state: 'progress', summary: '演示：原会话继续验证桌面端修复。', at: followupAt } })),
  };
  return { ...responses, 'tickets/demo-1': continued,
    overview: { ...(responses.overview as any), person: [review], executor: { running: 2, queued: 0, maxWorkers: 3, idle: 0 } },
    state: { ...(responses.state as any), load: { running: 2, queued: 0, maxWorkers: 3 } },
    tickets: { items: [{ ...continued, inputs: continued.inputs.length, assignments: continued.assignments.length }, review, working], total: 3, next_offset: null },
    threads: { items: [continuedThread], total: 1, next_offset: null } };
}
