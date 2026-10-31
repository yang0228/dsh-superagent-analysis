# 资料来源与分析范围

[返回首页](../../README.md) · [验证记录](verification.md)

## 固定版本

- 上游仓库：[deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)。
- 分析提交：[6337fc823ce20251c8de8085948165c81aaa701e](https://github.com/deepseek-ai/dsh-superagent-prototype/commit/6337fc823ce20251c8de8085948165c81aaa701e)。
- 提交说明：`feat: add the dsh-superagent research prototype`。
- 源码与远端提交核对日期：2026-11-01，Asia/Shanghai。

所有源码链接固定到这个提交。以后更新应同时核对正文、图示、截图组件和验证记录。

## 一手资料的用途

| 资料 | 本文使用方式 |
| --- | --- |
| [上游 README][upstream] | 原型定位、DSH Bundle 与研究范围 |
| [Philosophy][philosophy] | 以人的注意力为约束的设计动机 |
| [Domain model][domain]、[Authorization][authorization] | 概念、任务归属和授权边界 |
| [Execution][execution]、[Prompts][prompts] | 执行、恢复、交付与团队规则 |
| [Panel][panel]、[Deployment][install] | 管理界面、前提、启动和运维 |
| [Cookbook][cookbook] | Source 扩展契约；虚构示例只作为教学 |
| [源码索引](source-map.md) | 关键实现与对应测试的阅读入口 |

《Exploring Super-agent Design: Towards a More Autonomous Agent System》是上游 README 引用的架构文章。本版通过上游公开源码与文档解释可确认的实现；对持续实体的宏观动机作概念说明，不将文章中未在原型验证的设计列为当前功能，也不沿用未经本次一手材料核实的注意力容量数字。

## 仓库组织依据

GitHub 的[社区健康文件建议](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories)用于 README、贡献说明和模板组织。这些是推荐实践，不是所有公开仓库都必须满足的强制清单。

## 图像来源

机制图为本项目原创 Mermaid 表达。功能图片来自固定版本上游 React 组件的本地离线渲染，界面文案与 CSS 保持上游实现；外部宿主颜色变量和演示标识由预览提供，工单、统计与配置全部为演示数据。具体入口见[预览说明](../../tools/preview/README.md)，许可见[第三方声明](../../THIRD_PARTY_NOTICES.md)。

本轮不包含竞品研究或比较结论。

[authorization]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/002-authorization.md#L7
[cookbook]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/008-cookbook.md#L5
[domain]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/001-domain.md#L5
[execution]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/003-execution.md#L23
[install]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/006-deployment.md#L71
[panel]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/005-panel.md#L5
[philosophy]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/000-philosophy.md#L1
[prompts]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/004-prompts.md#L5
[upstream]: https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/README.md#L3
