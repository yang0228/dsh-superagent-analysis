# 离线界面预览与图片复现

[返回首页](../../README.md) · [查看截图检查报告](../../assets/screenshots/capture-report.json)

这里加载固定提交的真实上游 React App、CSS 和中文文案，配合静态管理 API 数据生成截图。宿主颜色变量、演示标识和场景导读由本预览提供，因此它是**真实组件的离线演示**，不是完整 DSH 宿主截图或真实账号联调。

## 准备与运行

需要 Node.js 22.19+ 或 24+。在本分析仓库根目录安装开发依赖；Playwright 首次截图还需安装 Chromium：

```sh
npm install
npx playwright install chromium
```

另准备上游源码，切到 `6337fc823ce20251c8de8085948165c81aaa701e`。执行以下命令时，将最后一个路径参数换成自己的上游检出目录：

```sh
node tools/preview/build.mjs /absolute/path/to/dsh-superagent-prototype
node tools/preview/serve.mjs
```

构建会检查上游 `src` 是否与固定提交一致；本分析不会改动上游源文件。服务仅监听 `127.0.0.1:4178`，可打开：

- [概览](http://127.0.0.1:4178/?view=overview)
- [工单详情：待回答](http://127.0.0.1:4178/?view=ticket)
- [同一工单：回答后续做](http://127.0.0.1:4178/?view=followup)
- [评估策略](http://127.0.0.1:4178/?view=policy)
- [执行配置](http://127.0.0.1:4178/?view=execution)

生成五张 PNG 和检查报告：

```sh
node tools/preview/capture.mjs
```

脚本自行启动临时端口，按内容边界截图以去掉页面留白，待回答图裁到授权详情底部以突出问题和范围；在续做场景中通过原生折叠控件展开输入与标识。它检查五个页面的异常、外部请求和只读写入拒绝，并核对两个任务快照沿用相同 Ticket、Session、目录、派工和 Mandate，之后退出服务。截图固定使用 Asia/Shanghai 时区。已有本机 Chromium 时，可用 `CHROME_PATH` 指向其可执行文件。

## 演示范围

工单、允许名单、统计、目录、模型名和配置均为虚构示例。外部链接使用 `example.test`，外跳会被拦截。fetch 只接受本源的预设管理 API；所有非 GET 调用返回 405，保存、停止、重试和同步不会修改任何真实系统。未提供数据的其他页面可能提示无演示数据。

三个任务场景是独立静态快照：概览与工单详情对应待回答阶段，followup 对应人的回答送达后。它们不是可提交回答、驱动状态流转的交互模拟器；其他工单使用不同讨论，避免身份混淆。

本预览用于理解界面和机制，不运行 Engine、不调用模型、不验证 GitHub 或飞书 API。应在隔离环境中按[原型上手指南](../../docs/05-getting-started.md)另外进行真实联调。

## 机制图复现

根目录开发依赖包括 Mermaid CLI 12；运行：

```sh
node tools/render-diagrams.mjs
```

它把四张流程图的 Mermaid 源文件导出为 SVG 与 PNG。横向架构图以可编辑的 `assets/diagrams/architecture.svg` 为排版源，直接导出 PNG；`architecture.mmd` 仅记录关系，不用于覆盖横向布局。可用 `MMDC` 指定已有的 mmdc 可执行文件，用 `CHROME_PATH` 指定浏览器。颜色、字号与字体定义在 `assets/diagrams/mermaid.config.json`。
