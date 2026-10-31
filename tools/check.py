#!/usr/bin/env python3
"""Check documentation assets, links, pinned citations and capture evidence (stdlib only)."""
import argparse
import json
import re
import struct
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SHA = '6337fc823ce20251c8de8085948165c81aaa701e'
PREFIX = 'https://github.com/deepseek-ai/dsh-superagent-prototype/blob/'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, help='Local upstream git checkout for pinned line validation')
    args = parser.parse_args()
    documents = [p for p in ROOT.rglob('*.md') if not any(part in {'node_modules', '.git', '.preview', '.superpowers'} for part in p.relative_to(ROOT).parts)]
    errors, citations, links = [], set(), 0
    for path in documents:
        text = path.read_text()
        definitions = re.findall(r'^\[([^\]]+)\]:\s*(\S+)', text, flags=re.M)
        defined = {name for name, target in definitions}
        for label in re.findall(r'\]\[([^\]]+)\]', text):
            if label not in defined:
                errors.append(f'{path.relative_to(ROOT)}: undefined link reference {label}')
        targets = re.findall(r'\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)', text) + [target for name, target in definitions]
        for target in targets:
            target = target.strip('<>')
            parsed = urlsplit(target)
            if parsed.scheme or not parsed.path:
                continue
            links += 1
            resolved = (path.parent / unquote(parsed.path)).resolve()
            if not resolved.is_relative_to(ROOT) or not resolved.exists():
                errors.append(f'{path.relative_to(ROOT)}: missing or outside local link {target}')
        for target in re.findall(re.escape(PREFIX) + r'([^\s)]+)', text):
            match = re.fullmatch(re.escape(SHA) + r'/([^#]+)#L(\d+)', target)
            if not match:
                errors.append(f'{path.relative_to(ROOT)}: citation is not pinned with a line: {target}')
            else:
                citations.add((unquote(match[1]), int(match[2])))
    if args.source:
        for file, line in sorted(citations):
            result = subprocess.run(['git', '-C', str(args.source), 'show', f'{SHA}:{file}'], capture_output=True, text=True)
            if result.returncode or not 1 <= line <= len(result.stdout.splitlines()):
                errors.append(f'Invalid pinned source: {file}:{line}')
    diagrams = sorted((ROOT / 'assets/diagrams').glob('*.mmd'))
    if len(diagrams) != 5:
        errors.append(f'Expected 5 diagrams, got {len(diagrams)}')
    for diagram in diagrams:
        svg, png = diagram.with_suffix('.svg'), diagram.with_suffix('.png')
        if not svg.exists() or not png.exists():
            errors.append(f'Missing rendered diagram: {diagram.stem}')
            continue
        try:
            ET.parse(svg)
        except ET.ParseError as error:
            errors.append(f'Invalid SVG {svg.name}: {error}')
    names = {'overview', 'ticket', 'policy', 'execution'}
    for name in names:
        path = ROOT / 'assets/screenshots' / (name + '.png')
        if not path.exists():
            errors.append(f'Missing screenshot: {name}')
            continue
        raw = path.read_bytes()
        if raw[:8] != b'\x89PNG\r\n\x1a\n':
            errors.append(f'Invalid PNG: {name}')
        elif min(struct.unpack('>II', raw[16:24])) < 800:
            errors.append(f'Insufficient screenshot resolution: {name}')
    report = ROOT / 'assets/screenshots/capture-report.json'
    if not report.exists():
        errors.append('Missing browser capture report')
    else:
        result = json.loads(report.read_text())
        if result['upstream'] != SHA or result['dataset'] != 'synthetic' or result['pageErrors'] or result['externalRequests']:
            errors.append('Capture report has wrong source, non-synthetic data, errors, or external requests')
        if {item['view'] for item in result['checks']} != names or any(item['readOnlyStatus'] != 405 for item in result['checks']):
            errors.append('Capture report does not prove all four read-only views')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(documents)} Markdown files, {links} local links, {len(citations)} unique pinned source citations, 5 rendered diagrams, 4 read-only screenshot views.')
    if not args.source:
        print('Source citation line ranges not checked; pass --source /path/to/upstream to include them.')

if __name__ == '__main__':
    main()
