# 源码索引与术语

[返回首页](../../README.md) · [架构专题](../02-architecture.md)

基线为 `6337fc823ce20251c8de8085948165c81aaa701e`。以下均为固定提交链接；当前分支的新代码不自动成为本文依据。

| 机制 | 首读位置 |
| --- | --- |
| 领域命令与事务入口 | [`src/core/engine.ts:24`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/engine.ts#L24) |
| 去重、过滤与订阅分发 | [`src/core/intake.ts:19`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/intake.ts#L19) |
| 工单、授权恢复和关闭规则 | [`src/core/tickets.ts:29`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/tickets.ts#L29) |
| 允许名单、接单模式与再验证 | [`src/policy.ts:171`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/policy.ts#L171) |
| 候选进入主会话的适配 | [`src/app/assessment.ts:89`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/assessment.ts#L89) |
| Worker 与输入生命周期 | [`src/executor/dsh.ts:207`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/executor/dsh.ts#L207) |
| 并发槽与人的继续执行机会 | [`src/executor/dsh.ts:171`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/executor/dsh.ts#L171) |
| SQLite 状态和事务 | [`src/app/store.ts:45`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/store.ts#L45) |
| 提交后的持久工作 | [`src/app/effects.ts:46`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/effects.ts#L46) |
| 消息回执和投递 | [`src/app/outbox.ts:22`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/outbox.ts#L22) |
| 组装与启停 | [`src/app/runtime.ts:59`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/runtime.ts#L59) |
| 面向人的工单阶段 | [`src/core/stage.ts:9`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/stage.ts#L9) |
| GitHub 接收配置 | [`src/sources/github.ts:25`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/sources/github.ts#L25) |
| 重叠游标与轮询帮助 | [`src/sources/poll.ts:14`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/sources/poll.ts#L14) |
| Source 扩展契约 | [`src/sources/kind.ts:89`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/sources/kind.ts#L89) |
| 面板与管理 API 契约 | [`src/app/api.ts:20`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/api.ts#L20) |

## 配套阅读与测试

| 想核对的行为 | 上游测试入口 |
| --- | --- |
| 接入、决策与领域不变量 | `tests/core-engine.spec.ts`、`tests/followups.spec.ts`、`tests/policy.spec.ts` |
| 重启、并发和调度 | `tests/runtime.spec.ts`、`tests/runtime-concurrency.spec.ts`、`tests/passes.spec.ts` |
| 持久化和外部投递 | `tests/store.spec.ts`、`tests/effects.spec.ts`、`tests/outbox.spec.ts`、`tests/delivery.spec.ts` |
| 来源与界面 | `tests/sources.spec.ts`、`tests/panel-overview.spec.tsx`、`tests/panel-settings.spec.tsx` |

这些测试是阅读与复核入口，不代表本分析制作时已运行上游完整测试套件。

## 术语速查

- **Router / 主 Session**：维持路由与协调的 DSH 会话，代码和提示词中常称 orchestrator。
- **Worker / Executor Session**：某个 Ticket 的执行会话；Executor 是将领域 Assignment 接到 DSH 的适配器。
- **Trigger / 触发事件**：一次来源事件；稳定 ID 是去重单位。
- **Thread / 讨论串**：来源定义的事件分组，可能包含多个任务。
- **Eval / 评估**：对候选批次的处理过程；Decision 是留下的决定。
- **Mandate / 授权**：这项工作为什么可以执行、范围多大。
- **Ticket / 工单**：一项持久的被授权工作。
- **Assignment / 派工**：一次执行尝试，可因恢复或重试被替换。
- **Subscription / 订阅**：讨论事件与任务之间的分发关系。
- **Attention / 待人工决定**：需要人回答的结构化问题。

准确语义与边界以[上游领域文档][domain]为准。

[domain]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/001-domain.md#L5
