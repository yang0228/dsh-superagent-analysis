import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = process.argv[2];
if (!source) throw new Error('Usage: node tools/preview/build.mjs /path/to/dsh-superagent-prototype');
const sha = '6337fc823ce20251c8de8085948165c81aaa701e';
execFileSync('git', ['-C', source, 'diff', '--exit-code', sha, '--', 'src'], { stdio: 'inherit' });
const out = resolve(root, '.preview'); mkdirSync(out, { recursive: true });
await build({ entryPoints: [resolve(root, 'tools/preview/entry.tsx')], bundle: true, outfile: resolve(out, 'app.js'),
  format: 'esm', platform: 'browser', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@upstream': resolve(source, 'src'), react: resolve(root, 'node_modules/react'), 'react-dom': resolve(root, 'node_modules/react-dom') },
  plugins: [{ name: 'upstream-css-raw', setup(build) {
    build.onResolve({ filter: /\.css\?raw$/ }, args => ({ path: resolve(args.resolveDir, args.path.replace(/\?raw$/, '')), namespace: 'css-raw' }));
    build.onLoad({ filter: /.*/, namespace: 'css-raw' }, args => ({ contents: readFileSync(args.path, 'utf8'), loader: 'text' }));
  } }], logLevel: 'info' });
const css = readFileSync(resolve(root, 'tools/preview/host.css'), 'utf8');
writeFileSync(resolve(out, 'index.html'), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DSH Superagent 组件演示</title><style>${css}</style><body><header class="preview-label"><strong>DSH SUPERAGENT</strong><span>上游界面，演示数据 · 只读离线预览 · 6337fc8</span></header><main id="app"></main><footer class="preview-foot">真实上游 React 组件 · 宿主颜色变量由预览提供 · 未连接 GitHub、飞书或模型</footer><script type="module" src="/app.js"></script></body></html>`);
