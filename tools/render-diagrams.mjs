import { readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = resolve(root, 'assets/diagrams');
const cli = process.env.MMDC || resolve(root, 'node_modules/.bin/mmdc');
const args = ['-c', resolve(directory, 'mermaid.config.json'), '-b', 'white', '--size', '1600', '-s', '2'];
if (process.env.CHROME_PATH) {
  const config = resolve(root, '.preview-puppeteer.json');
  writeFileSync(config, JSON.stringify({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] }));
  args.push('-p', config);
}
for (const name of readdirSync(directory).filter(name => name.endsWith('.mmd')).sort()) {
  for (const extension of ['svg', 'png']) {
    const result = spawnSync(cli, ['-i', resolve(directory, name), '-o', resolve(directory, name.replace('.mmd', '.' + extension)), ...args], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
