# 04 设计取舍：哪些机制值得借鉴

[返回首页](../README.md) · [上一章](03-capabilities.md) · [下一章：使用与上手](05-getting-started.md)

本章关注项目如何组织持续协作，以及把这些机制移到自己的项目时需要付出的代价。本轮不包含竞品对比，也不把通用设计模式称为排他性的“独有能力”。

## 1 把连续性放在任务与关系上

**问题**：如果以 Session 作为唯一单位，模型换了、执行中断了或任务暂时结束了，业务工作也容易跟着失去明确归属。

**实现**：Ticket 保存工作与 Mandate，Assignment 描述一次承接，Thread 和 Subscription 保存讨论的关联。DSH Session 是执行适配的一部分。恢复时可以替换 Assignment，而不是必须重新接受整个任务。[领域模型][domain]、[工单实现][tickets]

**可以借鉴**：优先给工作分配稳定业务 ID，记录输入和结果，再把它关联到模型会话。对于工单、审批、数据处理和运维任务，这比把完整状态藏在聊天记录里容易恢复与解释。

**代价**：必须定义谁拥有任务、哪些消息可以恢复它、何时算真正结束。仅有“持久 Session”还没有回答这些业务问题。

## 2 把信息送达与授权分开

**问题**：讨论中会同时出现人的请求、引用材料、机器人评论和 CI 状态。如果把所有上下文都当成新指令，任务边界会不断扩大。

**实现**：新工作的 gate 检查来源、身份和策略；接受时生成 Mandate。订阅可以把不同来源的相关消息作为 Input 送给工单，但不授予新权限。越界跟进需交回路由或形成新的接受决定。[授权][authorization]、[Intake][intake]

**可以借鉴**：在输入对象中明确区分“新请求”“事实更新”“只读参考”；权限依据来自可审计字段，不依赖模型从正文猜测。关键动作在应用层再次检查。

**代价**：后续消息归属和重新授权会变复杂。不能把所有复杂性压进一句“请勿越权”的提示词。

## 3 用订阅降低持续协调成本

**问题**：每条反馈都经过总调度者重新解释，容易形成路由瓶颈；由人手动转发则消耗注意力。

**实现**：Thread 到 Ticket 的订阅负责常规分发，Worker 决定已有工作中的跟进消息。Router 负责新的任务与需要重新路由的输入。Correlation 只增加证据，不负责消息路由。[领域模型][domain]

**可以借鉴**：把业务关联键当成分发依据，例如 incident ID、工单号、PR 编号。明确关联成功后，后续事件自动进入原任务；语义相似度只作为检索线索。

**代价**：需要处理一个讨论中多个任务、重复分发、任务结束后的订阅保留及人工停止。订阅不是“永远自动继续”。

## 4 事务只记录意图，外部动作随后执行

**问题**：状态已经写入但消息没发出去，或者请求发出后进程崩溃，都会让系统记录与外部世界不一致。

**实现**：Engine 事务写入领域状态，Effects 保存待处理动作，Outbox 保存消息回执。处理器在提交后发送与投递，失败时按规则重试。[Store][store]、[Effects][effects]、[Outbox][outbox]

**可以借鉴**：先把“需要执行这个动作”的意图与业务状态原子保存，再用可重试执行器处理；为外部动作设计稳定 ID 和回执。低吞吐场景先用同一数据库，不必立刻增加消息中间件。

**代价**：无法让任意外部 API 和本地事务一起回滚；对方不支持幂等时，必须明确重复效果怎么识别与处理。将“支持重试”宣传成“绝不重复执行”是不准确的。

## 5 让人的注意力成为稀缺资源

**问题**：增加 Agent 数量可能同时增加确认、进度通知和失败提醒，使人变成更忙的调度员。

**实现**：普通进度留在任务里，结构化问题成为 Attention，面板先显示待处理工单；短暂来源故障先重试，反复失败才升级为问题。并发槽为人的反馈保留继续执行机会。[设计哲学][philosophy]、[阶段分类][stage]、[槽位实现][slots]

**可以借鉴**：要求每条通知对应可采取的行动，按“谁接下来要做什么”展示状态。对同一问题去重，避免把每次工具调用都转成面向人的通知。

**代价**：安静的系统仍然需要留痕、可查状态和失败升级；不能把不报告失败当成降低噪声。应同时观察漏报、恢复延迟和人工干预次数。

## 6 明确代码、配置和提示词的职责

| 放置位置 | 适合的内容 | 在原型中的例子 |
| --- | --- | --- |
| 代码 | 状态一致性、授权基础、工具参数检查、投递规则 | Engine、Mandate 检查、Outbox 回执 |
| 配置 | 可枚举且需要校验的部署值与规则开关 | Source、允许名单、并发上限、observe/auto |
| 提示词与技能 | 团队如何工作、如何表达、如何交付 | 沟通风格、任务范围、PR 证据和合并约定 |

代码强制行为的优先级高于外部文本和团队提示词；但 Worker 的本地命令仍以 OS 用户权限运行，所以领域授权并不等于进程隔离。[提示词优先级][prompts]、[部署权限][deployment]

## 借鉴前先问自己的项目

你的“持续对象”是工作、客户、事故还是设备？哪类外部事件能延续它？哪些事件只提供背景？谁可以停止它？模型服务不可用时什么状态必须留下？什么情况一定要通知人？这些问题的答案应先落在业务模型里，再决定是否采用 Router/Worker、DSH 或其他运行框架。

[迁移指南](06-adaptation-guide.md)给出从直接部署到只复用机制的三条路径。

[authorization]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/002-authorization.md#L7
[deployment]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/006-deployment.md#L13
[domain]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/001-domain.md#L5
[effects]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/effects.ts#L46
[intake]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/intake.ts#L19
[outbox]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/outbox.ts#L22
[philosophy]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/000-philosophy.md#L1
[prompts]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/004-prompts.md#L5
[slots]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/executor/dsh.ts#L171
[stage]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/stage.ts#L9
[store]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/store.ts#L45
[tickets]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/tickets.ts#L29
