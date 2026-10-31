# 06 迁移指南：怎样用到自己的项目

[返回首页](../README.md) · [上一章](05-getting-started.md) · [源码索引](reference/source-map.md)

借鉴的起点是你的业务连续对象。先判断需要“运行现成原型”“扩展原型”，还是“在现有系统中采用部分机制”；不用为了复制架构图而引入整套 DSH。

## 路径一：直接部署到自己的仓库

适用于目标仍是单仓库研发协作，能接受 DSH 和账号运行环境的团队。沿[上手指南](05-getting-started.md)配置 Source、允许名单、prepare、沟通与交付要求，先缩小可发起工作的用户与范围。

主要改动落在配置、提示词与技能，而非 Engine。先证明一次小任务从请求到反馈能闭环，再扩大接收范围和主动规则。observed 的推断候选记录可以帮助审查自动接单是否合适，但显式请求仍需按真实写入行为评估。

## 路径二：新增事件入口

上游 Cookbook 用虚构 `hookq` CLI 演示新增 `webhook` Source。它说明扩展接口，不代表已有通用 webhook 服务可以直接启用。[扩展示例][cookbook]

| 需要实现的能力 | 你需要确定的业务含义 |
| --- | --- |
| 事件转换 | 什么算一个 Trigger，重试或编辑怎样生成稳定 ID，哪些是自己的消息应跳过 |
| 讨论分组 | 哪个业务键形成 Thread，如何找到原始上下文 |
| 接收范围 | 哪些队列、租户或讨论进入系统，范围外为何被过滤 |
| 授权字段 | 平台原生 actor ID、是否为人、是否明确请求 Agent，允许名单由谁维护 |
| Channel | 如何回复到正确位置，怎样识别目标已删除，如何处理幂等 |
| 运行循环 | 游标保存、重试、健康检查、关闭和恢复 |
| 设置与上下文 | 配置 schema、设置字段、必要环境变量和上下文读取 |

例如把客服单接入：Ticket 是被授权的处理工作，Thread 可以是同一客服单的消息流。稳定事件 ID 可来自平台消息 ID 与编辑版本；状态更新作为上下文进入旧任务，超出原范围的新要求重新路由。不要从消息正文提取“我是管理员”来赋予权限。

上游的 SourceKind 提供扩展契约，但新增来源不会自动获得内置技能、服务专属资源读取、PR 绑定或新的部署账号检查。这些额外能力需要逐项实现。[扩展接口][sources]、[Cookbook][cookbook]

## 路径三：在自己的 Agent 中复用机制

适用于已有模型调用与工具执行平台，只想解决重复执行、任务恢复或会话调度问题的项目。可以保留自己的模型底座，以端口和状态模型作为借鉴。

| 从原型借鉴 | 在现有系统中可以对应什么 | 首先要验证的情况 |
| --- | --- | --- |
| Trigger + stable ID | 幂等事件表 | 同一 webhook 重试不会创建两份工作 |
| Thread + Subscription | 业务事件到任务的关联表 | 同一任务的后续状态能找到原负责人 |
| Ticket + Assignment | 长期任务和执行尝试记录 | 执行重启不丢业务身份和历史结果 |
| Mandate | 任务范围与授权依据快照 | 新消息和资料不能自行扩大动作范围 |
| Effects + Outbox | 事务内动作意图与消息回执 | 提交后崩溃仍能处理；重试不会静默制造重复副作用 |
| Attention + stage | 等待决策的结构化字段 | 面板能够告诉人应回答、审核还是修复环境 |

### 一个最小的任务模型

下面是机制伪代码，用来说明职责划分，不是可直接替换 DSH 的 SDK：

```text
receive(event):
    transaction:
        if event.id already exists: return duplicate
        save event and its receiving disposition
        deliver context to subscribed tasks
        if no existing worker owns the human follow-up:
            queue evaluation under the current policy version

accept(candidate, scope):
    transaction:
        validate candidate and authorization
        create durable task and immutable mandate
        create execution attempt and subscriptions
        queue start intent

execute(start_intent):
    load the current task and attempt
    prepare the task's environment
    run or resume its agent session
    report structured result through the task service
```

真正迁移时还要补齐重复 accept、过期策略、消息归属、停止和失败恢复。伪代码省略了这些细节，因此源码仍是理解完整边界的依据。[Engine][engine]

## 分阶段落地

1. **先保住业务身份**：建立任务和执行记录，能把日志、结果与失败找回来。
2. **再接入可靠事件**：稳定 ID、去重、游标和订阅，让反馈到达正确任务。
3. **增加恢复能力**：事务内保存动作意图，明确哪些外部操作可安全重试，哪些需要核对。
4. **加入明确授权**：先区分新工作和参考信息，再开放主动接单。
5. **改善人工介入**：结构化提问、失败升级和可操作面板，减少重复解释与无效通知。

每一步都可以独立产生价值，不需要第一天就同时引入多 Agent、长期记忆平台和分布式调度。

## 必须自行承担的边界

原型以单个状态目录、SQLite 和 DSH 运行环境组织工作。迁移到多实例、多租户、跨仓库或不可信代码执行，需要另外设计锁、凭据与数据边界、资源限制和隔离。Mandate 保持业务授权的可解释性，不能替代操作系统与平台侧的权限控制。[持久化][store]、[部署权限][deployment]

借鉴完成的标准是：任务中断可解释、重复事件可控制、越界工作能被拦下、必要的人能收到可行动的信息。只把多个 Session 启动起来，还没有完成这些目标。

[cookbook]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/008-cookbook.md#L5
[deployment]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/006-deployment.md#L13
[engine]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/core/engine.ts#L24
[sources]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/sources/kind.ts#L89
[store]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/src/app/store.ts#L45
