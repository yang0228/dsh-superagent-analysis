<h1 align="center">DSH Superagent 剖析</h1>

<p align="center">
  <strong>读懂持续在线 Agent 的运行机制，把可借鉴的设计用到自己的项目。</strong>
</p>

<p align="center">
  <a href="docs/01-overview.md">项目概览</a> ·
  <a href="docs/02-architecture.md">架构设计</a> ·
  <a href="docs/03-capabilities.md">核心功能</a> ·
  <a href="docs/04-design-lessons.md">设计借鉴</a> ·
  <a href="docs/05-getting-started.md">使用上手</a> ·
  <a href="docs/06-adaptation-guide.md">迁移指南</a>
</p>

本项目以 DeepSeek 的 [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) 为工程样本，解释外部事件如何变成被授权的任务、如何并行执行、如何在反馈和重启后继续，以及何时需要人介入。

> **独立中文分析项目。** 上游为研究原型，与内部版本及架构文章并不完全相同。本文区分架构思路与公开原型的实际行为，以固定源码为依据；本版不含竞品对比。

## 从这里开始

| 你想了解什么 | 推荐阅读 |
| --- | --- |
| **先建立全景** | [项目概览](docs/01-overview.md) → [核心功能](docs/03-capabilities.md) |
| **读懂运行机制** | [架构设计](docs/02-architecture.md) → [源码索引](docs/reference/source-map.md) |
| **借鉴到自己的项目** | [设计取舍](docs/04-design-lessons.md) → [迁移指南](docs/06-adaptation-guide.md) |
| **动手尝试原项目** | [使用与上手](docs/05-getting-started.md) → [验证范围](docs/reference/verification.md) |

## 项目概览

Super-agent 探索的是让系统接过会话管理、信息分发与任务跟进，使人专注于**目标、决策和验收**。公开原型把这套思路应用于**单个 GitHub 仓库的研发协作**：作为 DSH Bundle，接入 GitHub 和可选飞书，维护持续工单，并把可用结果回到原讨论。

模型不是永远在推理；持续的是事件入口、工作状态与任务关系。Worker 的一个回合结束，也不意味着业务工作随之消失。

[深入阅读：项目定位、概念模型与适用范围 →](docs/01-overview.md)

## 架构设计

Source 将平台消息转成 Trigger，Engine 组织授权和工单状态，主 Session 负责语义路由，Executor 管理每个任务的 Worker 与目录。SQLite 保存工作脉络，Effects 和 Outbox 在事务提交后执行与投递。

[![公开原型实现架构：Source、Engine、会话、持久化与回复](assets/diagrams/architecture.svg)](assets/diagrams/architecture.svg)

<p align="center"><sub>点击查看完整架构图 · DSH 提供会话和执行能力；本图不表示已实现分布式 Agent 控制面。</sub></p>

[深入阅读：领域模型、调用路径、并发与持久化 →](docs/02-architecture.md) · [对照源码](docs/reference/source-map.md)

## 核心功能

| 能力 | 运行方式 |
| --- | --- |
| **事件驱动** | 接收授权用户的明确请求，也可按规则评估主动候选 |
| **并行执行** | 为任务分配持久工单、独立会话与目录，按并发上限执行 |
| **持续跟进** | 通过讨论订阅继续处理评论、审查与 CI 反馈 |
| **人工介入** | 将待回答、待审查、受阻和失败工作交给人处理 |
| **恢复与重试** | 保存输入、派工与投递记录，支持明确范围内的重试和恢复 |
| **配置与留痕** | 配置来源、策略、执行和提示词，并保留配置历史 |

### 功能演示

以下图片来自**真实上游 React 组件的离线渲染**，工单、统计与配置均为演示数据，未连接真实 GitHub、飞书或模型。点击图片可查看原图。

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>概览</strong><br>
      <sub>优先呈现需要人处理的工单与执行状态。</sub><br><br>
      <a href="assets/screenshots/overview.png"><img src="assets/screenshots/overview.png" width="480" alt="概览：待处理工单和执行状态，上游界面、演示数据"></a>
    </td>
    <td width="50%" valign="top">
      <strong>工单详情</strong><br>
      <sub>查看授权依据、任务范围和讨论订阅。</sub><br><br>
      <a href="assets/screenshots/ticket.png"><img src="assets/screenshots/ticket.png" width="480" alt="工单详情：授权依据和讨论订阅，上游界面、演示数据"></a>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>评估与授权</strong><br>
      <sub>理解允许名单、规则和 observe 模式。</sub><br><br>
      <a href="assets/screenshots/policy.png"><img src="assets/screenshots/policy.png" width="480" alt="评估策略：允许名单、规则与接单模式，上游界面、演示数据"></a>
    </td>
    <td width="50%" valign="top">
      <strong>执行环境</strong><br>
      <sub>定位模型、并发、目录与准备命令。</sub><br><br>
      <a href="assets/screenshots/execution.png"><img src="assets/screenshots/execution.png" width="480" alt="执行配置：模型、并发和工作目录，上游界面、演示数据"></a>
    </td>
  </tr>
</table>

[深入阅读：功能条件、反馈路径与状态边界 →](docs/03-capabilities.md) · [离线预览与图片复现](tools/preview/README.md)

## 设计取舍与借鉴

| 设计 | 借鉴价值 |
| --- | --- |
| **Ticket 与 Assignment 分开** | 业务任务可以跨执行尝试保持连续 |
| **Mandate 与上下文分开** | 收到新信息不自动扩大工作授权 |
| **Thread 与 Subscription** | 让后续反馈找到原任务，减少人工转发 |
| **Engine 与 Effects/Outbox** | 状态修改有事务边界，外部动作可记录和重试 |
| **路由与执行分工** | 将协调与具体工作分开，明确消息归属 |
| **结构化 Attention** | 告诉人需要回答、审核还是处理环境问题 |

这些设计的价值来自组合和边界管理。共享聊天记录、增加并发或多启动几个 Agent，并不能单独证明已经降低了人的协调成本。

[深入阅读：机制、代价和可借鉴方式 →](docs/04-design-lessons.md)

## 使用与上手

**只看机制与界面**：直接阅读文档和图片，或打开[离线预览](tools/preview/README.md)，不需要平台凭据。

**实际部署原型**：准备专用运行环境、Agent GitHub 账号和可用的 DSH 模型配置，从 GitHub-only、少数允许用户和小任务开始，按[上手指南](docs/05-getting-started.md)验收从事件到交付的完整路径。

> **使用边界**：`observe` 只阻止推断候选实际接单，显式授权请求仍可能执行；独立目录和命令包装不是 OS 沙箱。

### 迁移到自己的项目

[迁移指南](docs/06-adaptation-guide.md)提供三条路径，每条都说明依赖、替换点和验证思路：

1. **部署原型**：围绕自己的仓库配置现成工作流。
2. **增加 Source**：将新的平台事件接入原型。
3. **采用部分机制**：在已有 Agent 中借鉴任务建模、授权、订阅和可靠投递。

## 分析依据与验证

| 分析基线 | 内容 |
| --- | --- |
| 上游提交 | [`6337fc8`](https://github.com/deepseek-ai/dsh-superagent-prototype/commit/6337fc823ce20251c8de8085948165c81aaa701e) |
| 核对日期 | 2026-11-01，Asia/Shanghai |
| 图像资料 | 5 张机制图、4 张真实组件的演示数据截图 |
| 依据与范围 | [资料来源](docs/reference/sources.md) · [源码索引](docs/reference/source-map.md) · [验证记录](docs/reference/verification.md) |

## 贡献与许可

欢迎带源码位置和适用版本提交勘误，流程见 [CONTRIBUTING](CONTRIBUTING.md)。原创分析与图示采用 [MIT](LICENSE)；上游组件、文案及引用材料保留其原有署名和许可，见[第三方声明](THIRD_PARTY_NOTICES.md)。
